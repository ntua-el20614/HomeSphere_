// vacuumStatus.js

export function listenToVacuumStatus(CONFIG, onUpdate) {
    const haSocket = new WebSocket(CONFIG.HA_WEBSOCKET_URL);
    const HA_ACCESS_TOKEN = CONFIG.HA_ACCESS_TOKEN;
    const VACUUM_STATUS_SENSOR_ID = 'sensor.xiaomi_d106gl_529a_status';

    function sendToHASocket(message) {
        haSocket.send(JSON.stringify(message));
    }

    haSocket.onopen = () => {
        console.log("✅ Connected to Home Assistant");

        // 1. Authenticate
        sendToHASocket({
            type: "auth",
            access_token: HA_ACCESS_TOKEN
        });

        // 2. Subscribe to state changes
        setTimeout(() => {
            sendToHASocket({
                id: 1,
                type: "subscribe_events",
                event_type: "state_changed"
            });

            // 3. Request initial state
            sendToHASocket({
                id: 2,
                type: "get_states"
            });
        }, 500);
    };

    haSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Initial state load
        if (data.id === 2 && data.result) {
            const vacuum = data.result.find(e => e.entity_id === VACUUM_STATUS_SENSOR_ID);
            if (vacuum && onUpdate) {
                onUpdate({
                    status: vacuum.state,
                    attributes: vacuum.attributes
                });
            }
        }

        // Live state change
        if (data.event && data.event.event_type === "state_changed") {
            const entityId = data.event.data.entity_id;
            const newState = data.event.data.new_state;

            if (entityId === VACUUM_STATUS_SENSOR_ID && newState && onUpdate) {
                onUpdate({
                    status: newState.state,
                    attributes: newState.attributes
                });
            }
        }
    };

    haSocket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
    };

    haSocket.onclose = () => {
        console.warn("🔌 WebSocket closed");
    };

    // Return the socket in case caller wants to close it later
    return haSocket;
}
