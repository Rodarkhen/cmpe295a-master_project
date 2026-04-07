from __future__ import annotations

import asyncio
import json
import logging
from typing import TYPE_CHECKING, Any

import paho.mqtt.client as mqtt

if TYPE_CHECKING:
    from app.hub import PriceHub

logger = logging.getLogger(__name__)


class MqttBridge:
    """Background paho client: subscribe retail/price/# and forward to PriceHub."""

    def __init__(
        self,
        hub: PriceHub,
        host: str,
        port: int,
        loop: asyncio.AbstractEventLoop,
    ) -> None:
        self._hub = hub
        self._host = host
        self._port = port
        self._loop = loop
        self._client = mqtt.Client(
            client_id="dashboard-api-bridge",
            clean_session=True,
        )
        self._client.on_connect = self._on_connect
        self._client.on_message = self._on_message

    def _on_connect(
        self,
        client: mqtt.Client,
        userdata: Any,
        flags: Any,
        rc: int,
    ) -> None:
        if rc == 0:
            client.subscribe("retail/price/#", qos=1)
            logger.info("MQTT connected, subscribed to retail/price/#")
        else:
            logger.error("MQTT connect failed rc=%s", rc)

    def _on_message(self, client: mqtt.Client, userdata: Any, msg: mqtt.MQTTMessage) -> None:
        asyncio.run_coroutine_threadsafe(
            self._hub.ingest_price_mqtt(msg.topic, msg.payload),
            self._loop,
        )

    def start(self) -> None:
        logger.info("MQTT connecting to %s:%s", self._host, self._port)
        self._client.connect(self._host, self._port, keepalive=30)
        self._client.loop_start()

    def stop(self) -> None:
        self._client.loop_stop()
        self._client.disconnect()

    def publish_price(self, product_id: str, payload: dict[str, Any]) -> None:
        topic = f"retail/price/{product_id}"
        body = json.dumps(payload)
        info = self._client.publish(topic, body, qos=1)
        info.wait_for_publish(timeout=5.0)
