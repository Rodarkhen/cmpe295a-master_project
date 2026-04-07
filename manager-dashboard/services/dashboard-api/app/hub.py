from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect, WebSocketState

ISO = timezone.utc


class PriceHub:
    """In-memory latest prices + WebSocket fan-out (Sprint 1)."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._clients: set[WebSocket] = set()
        self._prices: dict[str, dict[str, Any]] = {}

    async def prices_snapshot(self) -> dict[str, dict[str, Any]]:
        async with self._lock:
            return dict(self._prices)

    async def register(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._clients.add(websocket)
            snap = dict(self._prices)
        await websocket.send_text(
            json.dumps({"type": "snapshot", "prices": snap}, default=str)
        )

    async def unregister(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._clients.discard(websocket)

    async def ingest_price_mqtt(self, topic: str, payload: bytes) -> None:
        row = _parse_price_row(topic, payload)
        message = json.dumps({"type": "price_update", "data": row}, default=str)
        async with self._lock:
            self._prices[row["product_id"]] = row
            clients = list(self._clients)
        await self._send_to_clients(clients, message)

    async def _send_to_clients(self, clients: list[WebSocket], text: str) -> None:
        dead: list[WebSocket] = []
        for ws in clients:
            if ws.client_state != WebSocketState.CONNECTED:
                dead.append(ws)
                continue
            try:
                await ws.send_text(text)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    self._clients.discard(ws)


def _parse_price_row(topic: str, payload: bytes) -> dict[str, Any]:
    try:
        body = json.loads(payload.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        body = {"raw": payload.decode("utf-8", errors="replace")}

    product_id = str(body.get("product_id") or _product_id_from_topic(topic))
    price = body.get("price")
    reason = body.get("reason")
    return {
        "product_id": product_id,
        "price": str(price) if price is not None else "",
        "reason": str(reason) if reason is not None else "",
        "topic": topic,
        "updated_at": datetime.now(tz=ISO).isoformat(),
    }


def _product_id_from_topic(topic: str) -> str:
    parts = topic.strip("/").split("/")
    if len(parts) >= 3 and parts[0] == "retail" and parts[1] == "price":
        return parts[2]
    return "unknown"


async def drain_client(websocket: WebSocket) -> None:
    """Keep connection open; detect disconnect when client closes."""
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        return
