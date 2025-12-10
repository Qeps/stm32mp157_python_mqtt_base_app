from flask import Flask, jsonify, request
from app.mqtt_client import MqttClient

def create_app():
    app = Flask(__name__, static_folder="../static", static_url_path="/")
    mqtt_client = MqttClient()

    @app.route("/")
    def index():
        return app.send_static_file("index.html")

    @app.post("/api/connect")
    def api_connect():
        data = request.get_json(silent=True) or {}
        broker = (data.get("broker") or "").strip()
        if not broker:
            return jsonify({"ok": False, "error": "Broker address required"}), 400
        try:
            mqtt_client.connect_url(broker)
            return jsonify({"ok": True, "status": "connected"})
        except Exception as exc:
            return jsonify({"ok": False, "error": str(exc)}), 400

    @app.post("/api/publish")
    def api_publish():
        data = request.get_json(silent=True) or {}
        topic = (data.get("topic") or "").strip()
        message = data.get("message") or ""

        if not topic:
            return jsonify({"ok": False, "error": "Topic required"}), 400
        if not mqtt_client.connected:
            return jsonify({"ok": False, "error": "Not connected to broker"}), 400
        try:
            mqtt_client.publish(topic, message)
            return jsonify({"ok": True, "status": "published"})
        except Exception as exc:
            return jsonify({"ok": False, "error": str(exc)}), 400

    return app

