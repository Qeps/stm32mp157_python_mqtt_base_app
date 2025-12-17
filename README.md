# MQTT Studio

Lightweight web tool for testing MQTT brokers - Flask backend with a single-page UI for publishing, subscribing, and live message monitoring.

## Highlights
- One-click connect to a broker via URL/IP with live online/offline status.
- Single and periodic publish (adjustable interval) to any topic.
- Multiple subscriptions with a live list of active topics.
- Sent/received logs with UTC timestamps and direction tags.
- Static UI served by Flask - runs in any browser, nothing to install on the client.

## Screenshots (placeholders)
- [full UI screenshot]
- [UI screenshot with received message]
- [terminal screenshot with subscription output]

## Project layout
- `main.py` - entry point starting the Flask app.
- `app/server.py` - API (connect, publish, subscribe, logs) and static file serving.
- `app/mqtt_client.py` - `paho-mqtt` wrapper for connect/publish/subscribe and bounded logs.
- `static/` - frontend assets: `index.html`, `style.css`, `app.js`.

## Using the app (after it is running)
- Open `http://localhost:5000/` in your browser.
- Enter the broker address (e.g., `mqtt://broker.hivemq.com:1883`) and click **Connect**.
- Publish messages (single/periodic) and subscribe to topics; sent/received logs update live.

## Accessing on STM32MP157
- Determine the board IP (e.g., `ip addr show` -> look for `inet 192.168.x.y`).
- From a device on the same network, open `http://<board-ip>:5000/` in a browser.
- If using USB RNDIS/ECM, the host typically sees the board at a link-local IP (e.g., `192.168.7.x`); use that address with port 5000.

## Requirements
- Python 3.9+.
- An MQTT broker reachable from the device for testing.
