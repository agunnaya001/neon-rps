"""
Coinbase Onramp session token generator.

Implements:
- JWT auth (Ed25519 / EdDSA) for Coinbase Developer Platform
- POST to https://api.developer.coinbase.com/onramp/v1/token to mint a session token
- Builds a hosted Onramp URL with Base + ETH defaults
"""

from __future__ import annotations

import base64
import os
import secrets
import time
from typing import Optional

import httpx
import jwt
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from fastapi import HTTPException
from pydantic import BaseModel, Field


CDP_API_KEY_NAME = os.environ.get("CDP_API_KEY_NAME", "").strip()
CDP_API_KEY_SECRET = os.environ.get("CDP_API_KEY_SECRET", "").strip()

CDP_HOST = "api.developer.coinbase.com"
CDP_TOKEN_PATH = "/onramp/v1/token"
ONRAMP_URL_BASE = "https://pay.coinbase.com/buy/select-asset"


def _load_private_key() -> Ed25519PrivateKey:
    """Decode the base64-encoded Ed25519 secret from CDP."""
    if not CDP_API_KEY_SECRET:
        raise RuntimeError("CDP_API_KEY_SECRET not configured")
    try:
        raw = base64.b64decode(CDP_API_KEY_SECRET)
    except Exception as exc:
        raise RuntimeError(f"CDP_API_KEY_SECRET is not valid base64: {exc}") from exc
    # Coinbase Ed25519 keys are 64 bytes: first 32 are the seed, last 32 are public.
    if len(raw) == 64:
        seed = raw[:32]
    elif len(raw) == 32:
        seed = raw
    else:
        raise RuntimeError(
            f"Unexpected Ed25519 key length: got {len(raw)} bytes (expected 32 or 64)"
        )
    return Ed25519PrivateKey.from_private_bytes(seed)


def _build_jwt(method: str, host: str, path: str) -> str:
    """Build a Coinbase CDP JWT for the given request."""
    if not CDP_API_KEY_NAME:
        raise RuntimeError("CDP_API_KEY_NAME not configured")

    private_key = _load_private_key()
    now = int(time.time())
    uri = f"{method.upper()} {host}{path}"
    payload = {
        "sub": CDP_API_KEY_NAME,
        "iss": "cdp",
        "nbf": now,
        "exp": now + 120,
        "uri": uri,
    }
    headers = {
        "kid": CDP_API_KEY_NAME,
        "nonce": secrets.token_hex(16),
        "typ": "JWT",
        "alg": "EdDSA",
    }
    return jwt.encode(payload, private_key, algorithm="EdDSA", headers=headers)


class OnrampSessionRequest(BaseModel):
    wallet_address: str = Field(
        ...,
        pattern=r"^0x[a-fA-F0-9]{40}$",
        description="Connected EVM wallet address",
    )
    partner_user_ref: Optional[str] = Field(
        default=None, description="Optional tracker linking the session to a user"
    )


class OnrampSessionResponse(BaseModel):
    url: str
    expires_in: int = 300  # session tokens expire in 5 minutes


async def create_onramp_session(req: OnrampSessionRequest) -> OnrampSessionResponse:
    """Mint a Coinbase Onramp session token, return a hosted purchase URL."""
    if not CDP_API_KEY_NAME or not CDP_API_KEY_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Coinbase Onramp is not configured on this server",
        )

    try:
        token = _build_jwt("POST", CDP_HOST, CDP_TOKEN_PATH)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    body = {
        "addresses": [{"address": req.wallet_address, "blockchains": ["base"]}],
        "assets": ["ETH"],
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"https://{CDP_HOST}{CDP_TOKEN_PATH}", json=body, headers=headers
        )

    if resp.status_code != 200:
        # Surface Coinbase error to help debugging while keeping detail bounded
        detail = resp.text[:500] if resp.text else f"status {resp.status_code}"
        raise HTTPException(
            status_code=502,
            detail=f"Coinbase Onramp token API error ({resp.status_code}): {detail}",
        )

    data = resp.json()
    session_token = data.get("token") or data.get("sessionToken")
    if not session_token:
        raise HTTPException(
            status_code=502, detail="Coinbase did not return a session token"
        )

    params = (
        f"sessionToken={session_token}"
        "&defaultNetwork=base"
        "&defaultAsset=ETH"
        "&presetCryptoAmount=0.01"
    )
    if req.partner_user_ref:
        params += f"&partnerUserRef={req.partner_user_ref}"

    return OnrampSessionResponse(url=f"{ONRAMP_URL_BASE}?{params}")
