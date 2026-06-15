"""
NexusVault — API Gateway
========================
FastAPI reverse-proxy that sits between the Vite frontend (port 5173)
and the Spring Boot backend (port 8080).

Responsibilities:
  • CORS enforcement
  • Per-IP rate limiting  (slowapi)
  • Structured request / response logging
  • Transparent proxy — forwards all headers including Authorization

Run:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import time
import logging
import uuid
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import BACKEND_URL, ALLOWED_ORIGINS, RATE_LIMIT, REQUEST_TIMEOUT

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("nexusvault.gateway")

# ── Rate Limiter ──────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address, default_limits=[RATE_LIMIT])

# ── Shared HTTP client (connection-pooled) ────────────────────────────────────

http_client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global http_client
    http_client = httpx.AsyncClient(base_url=BACKEND_URL, timeout=REQUEST_TIMEOUT)
    logger.info(f"Gateway started → proxying to {BACKEND_URL}")
    yield
    await http_client.aclose()
    logger.info("Gateway shutdown — HTTP client closed")


# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="NexusVault API Gateway",
    description="Reverse proxy with rate limiting and request logging",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allow only the configured frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Logging Middleware ───────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()

    logger.info(
        f"[{request_id}] ▶ {request.method} {request.url.path} "
        f"from {request.client.host if request.client else 'unknown'}"
    )

    response = await call_next(request)

    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        f"[{request_id}] ◀ {response.status_code} "
        f"({elapsed_ms:.1f}ms)"
    )
    return response


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["Gateway"])
async def health():
    """Gateway liveness probe — does NOT call backend."""
    return {"status": "ok", "gateway": "NexusVault", "backend": BACKEND_URL}


@app.get("/health/backend", tags=["Gateway"])
async def health_backend():
    """Checks that the Spring Boot backend is reachable."""
    try:
        r = await http_client.get("/actuator/health", timeout=5.0)
        return {"gateway": "ok", "backend_status": r.status_code}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"gateway": "ok", "backend": "unreachable", "detail": str(e)},
        )


# ── Universal Proxy ───────────────────────────────────────────────────────────

@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    tags=["Proxy"],
)
@limiter.limit(RATE_LIMIT)
async def proxy(request: Request, path: str):
    """
    Transparently proxies all /api/** requests to the Spring Boot backend.
    Forwards the original method, headers (including Authorization), query
    params, and body.  Rate-limited per IP.
    """
    # Build target URL
    target_url = f"/api/{path}"
    if request.url.query:
        target_url += f"?{request.url.query}"

    # Forward headers, scrub hop-by-hop
    headers = dict(request.headers)
    for hop_header in ("host", "connection", "transfer-encoding", "te",
                       "trailers", "upgrade", "keep-alive"):
        headers.pop(hop_header, None)

    # Read body
    body = await request.body()

    try:
        upstream = await http_client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Backend service is unavailable. Start Spring Boot on port 8080.",
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=f"Backend did not respond within {REQUEST_TIMEOUT}s.",
        )

    # Forward response back to client
    response_headers = dict(upstream.headers)
    # Remove hop-by-hop headers from upstream response
    for h in ("transfer-encoding", "connection", "keep-alive"):
        response_headers.pop(h, None)

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
        media_type=upstream.headers.get("content-type", "application/json"),
    )
