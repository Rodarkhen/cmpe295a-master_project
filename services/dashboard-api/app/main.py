import os
from typing import Optional

import psycopg2
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://retail:retail_dev@127.0.0.1:5432/retail_dashboard",
)

app = FastAPI(title="Retail Manager Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str


class DbHealthResponse(BaseModel):
    status: str
    detail: Optional[str] = None


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/api/health", response_model=HealthResponse)
def api_health() -> HealthResponse:
    return HealthResponse(status="ok")


def _check_database() -> DbHealthResponse:
    try:
        conn = psycopg2.connect(DATABASE_URL, connect_timeout=3)
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
        finally:
            conn.close()
    except Exception as exc:  # noqa: BLE001 — surface any DB error to caller
        return DbHealthResponse(status="error", detail=str(exc))
    return DbHealthResponse(status="ok")


@app.get("/health/db", response_model=DbHealthResponse)
def health_db() -> DbHealthResponse:
    return _check_database()


@app.get("/api/health/db", response_model=DbHealthResponse)
def api_health_db() -> DbHealthResponse:
    return _check_database()


@app.websocket("/ws/prices")
async def price_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except Exception:
        return


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
