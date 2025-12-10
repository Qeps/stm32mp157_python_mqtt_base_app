import threading
from urllib.parse import urlparse
import paho.mqtt.client as mqtt


class MqttClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.connected = False
        self.last_error = None
        self._connect_event = threading.Event()

    def connect_url(self, url, keepalive=60):
        parsed = urlparse(url if "://" in url else f"mqtt://{url}")
        host = parsed.hostname
        port = parsed.port or 1883
        if not host:
            raise ValueError("Broker address required")

        self._connect_event.clear()
        self.connected = False
        self.last_error = None

        def on_connect(client, userdata, flags, rc):
            self.connected = rc == 0
            self.last_error = None if self.connected else mqtt.connack_string(rc)
            self._connect_event.set()

        self.client.on_connect = on_connect
        self.client.connect(host, port, keepalive)
        self.client.loop_start()

        self._connect_event.wait(timeout=3)
        if not self.connected:
            self.client.loop_stop()
            raise ConnectionError(self.last_error or "Unable to connect")
        return True

    def publish(self, topic, message):
        if self.connected:
            self.client.publish(topic, message)
        else:
            raise RuntimeError("MQTT client not connected")
