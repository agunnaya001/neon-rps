"""Backend API tests for Neon RPS dApp.

Covers: FastAPI proxy -> Node Express health, OG image, share HTML, healthz.
"""
import os
import re

import pytest
import requests

BASE_URL = "https://5f994dc7-8c00-4d58-a02b-665468237121.preview.emergentagent.com"
# Allow override from REACT_APP_BACKEND_URL when present and non-empty
_env_url = os.environ.get("REACT_APP_BACKEND_URL")
if _env_url:
    BASE_URL = _env_url.rstrip("/")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"User-Agent": "neon-rps-test/1.0"})
    return s


# ---------- Health endpoints ----------
class TestHealth:
    def test_healthz_node(self, session):
        r = session.get(f"{BASE_URL}/api/healthz", timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("status") == "ok"

    def test_health_fastapi(self, session):
        r = session.get(f"{BASE_URL}/api/health", timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        # Node subprocess should be up and reachable
        assert body.get("node_api") is True, body


# ---------- OG image endpoint ----------
class TestOGImage:
    def test_og_image_returns_png(self, session):
        r = session.get(f"{BASE_URL}/api/og/game/1", timeout=60)
        assert r.status_code == 200, r.text[:500]
        ctype = r.headers.get("content-type", "")
        assert "image/png" in ctype.lower(), ctype
        # PNG magic header
        assert r.content[:8] == b"\x89PNG\r\n\x1a\n", "not a valid PNG"
        assert len(r.content) > 1000, "PNG suspiciously small"


# ---------- Share endpoint ----------
class TestShare:
    def test_share_returns_html_with_meta(self, session):
        r = session.get(f"{BASE_URL}/api/share/g/1", timeout=30)
        assert r.status_code == 200, r.text[:500]
        ctype = r.headers.get("content-type", "")
        assert "text/html" in ctype.lower(), ctype
        body = r.text
        # Open Graph meta tags
        assert re.search(r'property="og:title"', body), "og:title missing"
        assert re.search(r'property="og:image"[^>]+/api/og/game/1', body), "og:image missing or wrong"
        assert re.search(r'property="og:url"[^>]+/game/1', body), "og:url missing or wrong"
        # Twitter card
        assert re.search(r'name="twitter:card"', body), "twitter:card missing"
        # http-equiv refresh redirect to /game/1
        assert re.search(r'http-equiv="refresh"[^>]+/game/1', body), "refresh redirect missing"
