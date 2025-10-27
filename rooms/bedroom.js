import * as THREE from '/local/HomeSphere/three/build/three.module.js';
import { addDecorativeDoor } from '../utils/Door.js';
import { addGlassDoor } from '../utils/GlassDoor.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { getDeviceStatus } from '../utils/IsOnline.js';
import { createWizzLight } from '../utils/wizzLight.js';
import { CONFIG } from '../config.js';

export async function createBedroom(scene) {
    const devices = [];
    const bedroomGroup = new THREE.Group();
    scene.add(bedroomGroup);

    const LIGHT_ENTITY_ID = 'light.bedroom';
    const BEDROOM_BLIND_ENTITY_ID = 'cover.bedroom_blind';
    const WINDOW_BLIND_ENTITY_ID = 'cover.window_blind';
    const HA_ACCESS_TOKEN = CONFIG.HA_ACCESS_TOKEN;

    // =========================
    // Floor
    // =========================
    const bedroomShape = new THREE.Shape();
    bedroomShape.moveTo(39, 40);
    bedroomShape.lineTo(39, 42);
    bedroomShape.lineTo(38, 42);
    bedroomShape.lineTo(38, 43);
    bedroomShape.lineTo(22.85, 37);
    bedroomShape.lineTo(26, 29);
    bedroomShape.lineTo(38, 29);
    bedroomShape.lineTo(38, 40);
    bedroomShape.closePath();

    const extrudePath = new THREE.LineCurve3(
        new THREE.Vector3(0, 0.01, 0),
        new THREE.Vector3(0, 0, 0)
    );
    const extrudeSettings = { steps: 1, extrudePath, bevelEnabled: false };
    const floorGeometry = new THREE.ExtrudeGeometry(bedroomShape, extrudeSettings);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0 
    });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    bedroomGroup.add(floorMesh);

    // =========================
    // Doors
    // =========================
    addDecorativeDoor(bedroomGroup, 31, 25.2, 158.5, 2, 5);

    function updateAllBedroomBlinds(position) {
        bedroomDoor1?.updateBlinds?.(position);
        bedroomDoor2?.updateBlinds?.(position);
    }

    function updateAllWindowBlinds(position) {
        windowDoor1?.updateBlinds?.(position);
        windowDoor2?.updateBlinds?.(position);
    }

    // =========================
    // Light Setup
    // =========================
    const wizzLightController = createWizzLight(
        LIGHT_ENTITY_ID,
        bedroomGroup,
        CONFIG,
        new THREE.Vector3(34, 6, -32)
    )//,position = { x: 34, y: 6, z: -32 });

    // =========================
    // Light Toggle on Keypress
    // =========================
    wizzLightController.mesh.userData.interactive = true;
    wizzLightController.mesh.userData.onClick = () => {
        console.log("🖱️ Bulb clicked/tapped. Toggling badroom light...");
        wizzLightController.toggle();
    };
    devices.push(wizzLightController.mesh);

    window.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "b") {
            console.log("🕹️ 'B' key pressed! Toggling bedroom light...");
            wizzLightController.toggle();
        }
    });

    // =========================
    // WebSocket for Blinds Only
    // =========================

    const bedroomDoor1 = addGlassDoor(
        bedroomGroup, 29, 29.5, 90, 2.5, 4.5, false, false,
        BEDROOM_BLIND_ENTITY_ID, sendToHASocket, null
    );
    const bedroomDoor2 = addGlassDoor(
        bedroomGroup, 29, 32, 90, 2.5, 4.5, true, false,
        BEDROOM_BLIND_ENTITY_ID, sendToHASocket, null
    );
    const windowDoor1 = addGlassDoor(
        bedroomGroup, 32.5, 38, 0, 2, 3, false, true,
        WINDOW_BLIND_ENTITY_ID, sendToHASocket, null
    );
    const windowDoor2 = addGlassDoor(
        bedroomGroup, 34.5, 38, 0, 2, 3, true, true,
        WINDOW_BLIND_ENTITY_ID, sendToHASocket, null
    );

    function updateAllBedroomBlinds(position, animate = true) {
        bedroomDoor1.updateBlinds?.(position, animate);
        bedroomDoor2.updateBlinds?.(position, animate);
    }

    function updateAllWindowBlinds(position, animate = true) {
        windowDoor1.updateBlinds?.(position, animate);
        windowDoor2.updateBlinds?.(position, animate);
    }

    const haSocket = new WebSocket(CONFIG.HA_WEBSOCKET_URL);

    function sendToHASocket(message) {
        haSocket.send(JSON.stringify(message));
    }

    haSocket.onopen = () => {
        console.log("✅ Connected to HA WebSocket (bedroom.js)");

        sendToHASocket({ type: "auth", access_token: HA_ACCESS_TOKEN });

        setTimeout(() => {
            sendToHASocket({ id: 1, type: "subscribe_events", event_type: "state_changed" });
            sendToHASocket({ id: 2, type: "get_states" });
        }, 500);
    };

    haSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.event?.event_type === "state_changed") {
            const entityId = data.event.data.entity_id;
            const newState = data.event.data.new_state;

            if (entityId === BEDROOM_BLIND_ENTITY_ID) {
                updateAllBedroomBlinds(newState.attributes.current_position ?? 0);
            }

            if (entityId === WINDOW_BLIND_ENTITY_ID) {
                updateAllWindowBlinds(newState.attributes.current_position ?? 0);
            }
        }

        if (data.id === 2 && data.result) {
            const bedroomBlindState = data.result.find(e => e.entity_id === BEDROOM_BLIND_ENTITY_ID);
            if (bedroomBlindState) {
                updateAllBedroomBlinds(bedroomBlindState.attributes.current_position ?? 0, false);
            }

            const windowBlindState = data.result.find(e => e.entity_id === WINDOW_BLIND_ENTITY_ID);
            if (windowBlindState) {
                updateAllWindowBlinds(windowBlindState.attributes.current_position ?? 0, false);
            }
        }
    };

    devices.push(bedroomDoor1.glassPanel);
    devices.push(bedroomDoor2.glassPanel);
    devices.push(windowDoor1.glassPanel);
    devices.push(windowDoor2.glassPanel);


    // =========================
    // Load 3D Models
    // =========================
    const loader = new GLTFLoader();

    function isDesktop() {
        const ua = navigator.userAgent.toLowerCase();
        const isMobile = /android|iphone|ipad|ipod|mobile|tablet/i.test(ua);
        return !isMobile;
      }
    if (isDesktop()) {

    // Bed
    loader.load('/local/HomeSphere/models/bed.glb', (gltf) => {
        const bed = gltf.scene;
        bed.rotation.y = THREE.MathUtils.degToRad(248);
        bed.scale.set(3, 3, 3.5);
        bed.position.set(36.75, 1.5, -32);
        bedroomGroup.add(bed);
    });

    // Shelf
    loader.load('/local/HomeSphere/models/bedroom_shelf.glb', (gltf) => {
        const shelf = gltf.scene;
        shelf.scale.set(2.25, 1.25, 2.25);
        shelf.position.set(29.65, 1.2, -36.15);
        bedroomGroup.add(shelf);
    });

    // Echo
    const echo_status = await getDeviceStatus(17);
    loader.load('/local/HomeSphere/models/echo.glb', (gltf) => {
        const echo = gltf.scene;
        echo.scale.set(0.25, 0.2, 0.25);
        echo.position.set(29.65, 2.575, -35);
        bedroomGroup.add(echo);

        echo.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xdedede,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });

        const color = echo_status.online ? 0x00ff00 : 0xff0000;
        const geometry = new THREE.TorusGeometry(0.16, 0.05, 32, 100);
        const material = new THREE.MeshBasicMaterial({ color });
        const ring = new THREE.Mesh(geometry, material);
        ring.position.set(29.65, 2.675, -35);
        ring.rotation.x = -THREE.MathUtils.degToRad(90);
        bedroomGroup.add(ring);
    });

    // Wardrobes
    loader.load('/local/HomeSphere/models/small_wardrobe.glb', (gltf) => {
        const wardrobe = gltf.scene;
        wardrobe.scale.set(-3.5, 3, 3.0);
        wardrobe.position.set(41, 2.9, -38);
        bedroomGroup.add(wardrobe);
    });

    loader.load('/local/HomeSphere/models/wardrobe.glb', (gltf) => {
        const wardrobe = gltf.scene;
        wardrobe.rotation.y = THREE.MathUtils.degToRad(248);
        wardrobe.scale.set(3, 3, 3);
        wardrobe.position.set(35.5, 2.9, -25.75);
        bedroomGroup.add(wardrobe);
    });
    }
    return { devices };
}
