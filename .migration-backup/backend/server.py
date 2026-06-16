"""
FastAPI adapter for Neon RPS.

Supervisor expects uvicorn on port 8001. This app:
1. Launches the Node Express OG/share server on port 8002 as a subprocess
2. Proxies all /api/* requests to it
3. Exposes /api/health for liveness checks
4. Implements /api/onramp/session — Coinbase Onramp session token + URL
"""

import asyncio
import os
import signal
import subprocess
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

# Load .env BEFORE importing modules that read environment variables.
load_dotenv(Path(__file__).parent / ".env")

from onramp import (  # noqa: E402
    OnrampSessionRequest,
    OnrampSessionResponse,
    create_onramp_session,
)

NODE_API_PORT = int(os.environ.get("NODE_API_PORT", "8002"))
NODE_API_URL = f"http://127.0.0.1:{NODE_API_PORT}"
API_SERVER_DIR = Path("/app/artifacts/api-server")

state = {"node_proc": None, "client": None}


async def start_node_server():
    """Start the Express OG/share server as a subprocess."""
    env = os.environ.copy()
    env["PORT"] = str(NODE_API_PORT)
    env["NODE_ENV"] = "production"
    env.setdefault("CONTRACT_ADDRESS", "0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD")
    env.setdefault("BASE_RPC_URL", "https://mainnet.base.org")

    proc = subprocess.Popen(
        ["node", "--enable-source-maps", "./dist/index.mjs"],
        cwd=str(API_SERVER_DIR),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    state["node_proc"] = proc
    # Wait for it to become ready
    client = httpx.AsyncClient(timeout=10.0)
    for _ in range(40):
        try:
            r = await client.get(f"{NODE_API_URL}/api/healthz")
            if r.status_code < 500:
                break
        except Exception:
            pass
        await asyncio.sleep(0.25)
    state["client"] = client


async def stop_node_server():
    if state["client"]:
        await state["client"].aclose()
    proc = state["node_proc"]
    if proc and proc.poll() is None:
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            proc.wait(timeout=5)
        except Exception:
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
            except Exception:
                pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    await start_node_server()
    yield
    await stop_node_server()


app = FastAPI(title="Neon RPS Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Strip hop-by-hop headers
HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
    "content-encoding",
}


@app.get("/api/health")
async def health():
    """Direct health endpoint (also proxied to node, but useful as fallback)."""
    node_ok = False
    try:
        if state["client"]:
            r = await state["client"].get(f"{NODE_API_URL}/api/healthz", timeout=2.0)
            node_ok = r.status_code == 200
    except Exception:
        node_ok = False
    return {"status": "ok", "service": "neon-rps-backend", "node_api": node_ok}


@app.post("/api/onramp/session", response_model=OnrampSessionResponse)
async def onramp_session(req: OnrampSessionRequest):
    """Mint a Coinbase Onramp session URL for buying ETH on Base."""
    return await create_onramp_session(req)


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
)
async def proxy(path: str, request: Request):
    """Proxy everything under /api/* to the Node Express server."""
    client: httpx.AsyncClient = state["client"]
    if client is None:
        return Response(status_code=503, content=b"Node API not ready")

    url = f"{NODE_API_URL}/api/{path}"
    if request.url.query:
        url = f"{url}?{request.url.query}"

    headers = {
        k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP
    }
    body = await request.body()

    try:
        r = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=body,
            timeout=30.0,
        )
    except httpx.ConnectError:
        return Response(status_code=502, content=b"Node API unreachable")
    except httpx.TimeoutException:
        return Response(status_code=504, content=b"Node API timeout")

    out_headers = {
        k: v for k, v in r.headers.items() if k.lower() not in HOP_BY_HOP
    }
    return Response(
        content=r.content,
        status_code=r.status_code,
        headers=out_headers,
        media_type=r.headers.get("content-type"),
    )
