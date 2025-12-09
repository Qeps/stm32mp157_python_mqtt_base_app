import paho.mqtt.client as mqtt

class MqttClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.connected = False

    def connect(self, host, port=1883, keepalive=60):
        def on_connect(client, userdata, flags, rc):
            self.connected = (rc == 0)

        self.client.on_connect = on_connect
        self.client.connect(host, port, keepalive)
        self.client.loop_start()

    def publish(self, topic, message):
        if self.connected:
            self.client.publish(topic, message)
        else:
            raise RuntimeError("MQTT client not connected")
