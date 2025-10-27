import * as THREE from '/local/HomeSphere/three/build/three.module.js';

export function createWizzLight(LIGHT_ENTITY_ID, parentGroup, CONFIG, lightPosition = new THREE.Vector3(0, 5, 0)) {
    const bulbLight = new THREE.PointLight(0xffffff, 0, 100);
    bulbLight.position.copy(lightPosition);
    bulbLight.castShadow = true;
    parentGroup.add(bulbLight);

    const bulbGeometry = new THREE.SphereGeometry(0.5, 16, 8);
    const bulbMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x000000
    });

    const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulbMesh.position.copy(lightPosition);
    bulbMesh.userData.isLight = true;
    parentGroup.add(bulbMesh);

    let haSocket = null;

    function sendToHASocket(message) {
        if (haSocket && haSocket.readyState === WebSocket.OPEN) {
            haSocket.send(JSON.stringify(message));
        }
    }

    function updateLightState(lightState) {
        if (!lightState) return;

        const isOn = lightState.state === "on";
        const haBrightness = lightState.attributes.brightness ?? 255;
        const normalizedBrightness = haBrightness / 255;
        const minIntensity = 0.05;
        const maxIntensity = minIntensity * 5000;
        const finalIntensity = minIntensity + normalizedBrightness * (maxIntensity - minIntensity);

        bulbLight.intensity = isOn ? finalIntensity : 0;

        const rgb = lightState.attributes.rgb_color || [255, 255, 255];
        bulbLight.color.setRGB(...rgb.map(c => c / 255));
        bulbMaterial.color.setRGB(...rgb.map(c => c / 255));
        bulbMaterial.emissive.setRGB(...rgb.map(c => (isOn ? 0.3 * (c / 255) : 0)));

        parentGroup.traverse(obj => {
            if (obj instanceof THREE.Mesh && obj.material?.emissive) {
                obj.material.emissive.setRGB(...(isOn ? rgb.map(c => 0.1 * (c / 255)) : [0, 0, 0]));
            }
        });

        if (lightState.state === "unavailable") {
            bulbLight.intensity = 0.02;
            bulbMaterial.color.setHex(0x555555);
            bulbMaterial.emissive.setHex(0x000000);

            if (!bulbMesh.userData.redX) {
                const xMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
                const xGroup = new THREE.Group();

                [Math.PI / 4, -Math.PI / 4].forEach(rot => {
                    const xGeom = new THREE.CylinderGeometry(0.25, 0.25, 1.5, 16);
                    const xMesh = new THREE.Mesh(xGeom, xMaterial);
                    xMesh.position.copy(lightPosition);
                    xMesh.rotation.z = rot;
                    xGroup.add(xMesh);
                });

                parentGroup.add(xGroup);
                bulbMesh.userData.redX = xGroup;
            }
        } else if (bulbMesh.userData.redX) {
            parentGroup.remove(bulbMesh.userData.redX);
            bulbMesh.userData.redX = null;
        }
    }

    function initHASocket() {
        haSocket = new WebSocket(CONFIG.HA_WEBSOCKET_URL);

        haSocket.onopen = () => {
            console.log("✅ Connected to Home Assistant WebSocket (WizzLight)");
            sendToHASocket({ type: "auth", access_token: CONFIG.HA_ACCESS_TOKEN });

            setTimeout(() => {
                sendToHASocket({ id: 1, type: "subscribe_events", event_type: "state_changed" });
                sendToHASocket({ id: 2, type: "get_states" });
            }, 500);
        };

        haSocket.onclose = () => {
            console.warn("🔌 WizzLight WebSocket closed. Reconnecting...");
            setTimeout(initHASocket, 2000);
        };

        haSocket.onerror = (err) => {
            console.error("🛑 WizzLight WebSocket error:", err);
            haSocket.close();
        };

        haSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.event?.event_type === "state_changed" && data.event.data.entity_id === LIGHT_ENTITY_ID) {
                updateLightState(data.event.data.new_state);
            }

            if (data.id === 2 && data.result) {
                const state = data.result.find(e => e.entity_id === LIGHT_ENTITY_ID);
                if (state) updateLightState(state);
            }
        };
    }

    function toggleLight() {
        if (haSocket?.readyState !== WebSocket.OPEN) {
            console.warn("⛔ WebSocket not open. Toggle skipped.");
            return;
        }

        sendToHASocket({
            id: Date.now(),
            type: "call_service",
            domain: "light",
            service: "toggle",
            service_data: {
                entity_id: LIGHT_ENTITY_ID
            }
        });
    }

    initHASocket();

    return {
        toggle: toggleLight,
        mesh: bulbMesh
    };
}
