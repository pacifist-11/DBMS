"""
Gateway configuration — centralise all tuneable values here.
"""

# Spring Boot backend address
BACKEND_URL: str = "http://localhost:8080"

# Vite dev server (frontend) — allowed CORS origin
ALLOWED_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://localhost:4173",   # Vite preview
]

# slowapi rate limit string (requests / time-window)
RATE_LIMIT: str = "30/minute"

# Proxy request timeout in seconds
REQUEST_TIMEOUT: float = 30.0
