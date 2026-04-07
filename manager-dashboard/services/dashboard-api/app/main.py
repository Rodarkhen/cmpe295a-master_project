from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Optional

import psycopg2
from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.hub import PriceHub, drain_client
from app.mqtt_bridge import MqttBridge

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://retail:retail_dev@127.0.0.1:5432/retail_dashboard",
)
MQTT_HOST = os.environ.get("MQTT_BROKER_HOST", "127.0.0.1")
MQTT_PORT = int(os.environ.get("MQTT_BROKER_PORT", "1883"))
MQTT_ENABLED = os.environ.get("MQTT_ENABLED", "true").lower() in ("1", "true", "yes")
DEV_MQTT_PUBLISH = os.environ.get("DEV_MQTT_PUBLISH", "true").lower() in (
    "1",
    "true",
    "yes",
)

hub = PriceHub()
_mqtt_bridge: MqttBridge | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _mqtt_bridge
    if MQTT_ENABLED:
        try:
            loop = asyncio.get_running_loop()
            _mqtt_bridge = MqttBridge(hub, MQTT_HOST, MQTT_PORT, loop)
            _mqtt_bridge.start()
            app.state.mqtt_bridge = _mqtt_bridge
        except Exception:
            logger.exception("MQTT bridge failed to start; continuing without MQTT")
            _mqtt_bridge = None
            app.state.mqtt_bridge = None
    else:
        app.state.mqtt_bridge = None
        logger.info("MQTT disabled (MQTT_ENABLED=false)")
    app.state.hub = hub
    yield
    if _mqtt_bridge is not None:
        _mqtt_bridge.stop()
        _mqtt_bridge = None


app = FastAPI(
    title="Retail Manager Dashboard API",
    version="0.2.0",
    lifespan=lifespan,
)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": app.title,
        "version": app.version,
        "docs": "/docs",
        "openapi": "/openapi.json",
        "health": "/health",
        "websocket_prices": "/ws/prices",
        "prices_rest": "/api/prices",
    }


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


class MqttHealthResponse(BaseModel):
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
    except Exception as exc:  # noqa: BLE001
        return DbHealthResponse(status="error", detail=str(exc))
    return DbHealthResponse(status="ok")


@app.get("/health/db", response_model=DbHealthResponse)
def health_db() -> DbHealthResponse:
    return _check_database()


@app.get("/api/health/db", response_model=DbHealthResponse)
def api_health_db() -> DbHealthResponse:
    return _check_database()


@app.get("/api/health/mqtt", response_model=MqttHealthResponse)
def api_health_mqtt(request: Request) -> MqttHealthResponse:
    bridge = getattr(request.app.state, "mqtt_bridge", None)
    if not MQTT_ENABLED:
        return MqttHealthResponse(status="disabled")
    if bridge is None:
        return MqttHealthResponse(status="error", detail="bridge not running")
    return MqttHealthResponse(status="ok")


@app.get("/api/prices")
async def list_prices() -> dict[str, Any]:
    prices = await hub.prices_snapshot()
    return {"prices": prices}


class DevPublishBody(BaseModel):
    product_id: str = Field(..., min_length=1)
    price: str = Field(..., min_length=1)
    reason: str = ""


@app.post("/api/dev/publish-price")
async def dev_publish_price(request: Request, body: DevPublishBody) -> dict[str, str]:
    """Publish a workbook-style payload to MQTT (local smoke tests)."""
    if not DEV_MQTT_PUBLISH:
        return {"status": "forbidden", "detail": "DEV_MQTT_PUBLISH disabled"}
    bridge = getattr(request.app.state, "mqtt_bridge", None)
    if bridge is None:
        return {"status": "error", "detail": "MQTT bridge not available"}
    payload = {
        "product_id": body.product_id,
        "price": body.price,
        "reason": body.reason or "dev publish",
    }
    await asyncio.to_thread(bridge.publish_price, body.product_id, payload)
    return {"status": "published", "topic": f"retail/price/{body.product_id}"}


@app.websocket("/ws/prices")
async def price_stream(websocket: WebSocket) -> None:
    await hub.register(websocket)
    try:
        await drain_client(websocket)
    finally:
        await hub.unregister(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
