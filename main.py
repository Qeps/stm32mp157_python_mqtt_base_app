import threading
import time
from app.server import create_app
from app.mqtt_client import MqttClient

def mqtt_periodic_sender():
    mqttc = MqttClient()
    mqttc.connect("localhost", 1883)
    time.sleep(1)

    counter = 0
    while True:
        msg = f"Periodic test message {counter}"
        mqttc.publish("test/topic", msg)
        counter += 1
        time.sleep(2)

if __name__ == "__main__":
    t = threading.Thread(target=mqtt_periodic_sender, daemon=True)
    t.start()

    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
