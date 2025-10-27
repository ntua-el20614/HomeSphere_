import * as THREE from '/local/HomeSphere/three/build/three.module.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { addDecorativeDoor } from '../utils/Door.js';
import { addGlassDoor } from '../utils/GlassDoor.js';
import { createWizzLight } from '../utils/wizzLight.js';
import { CONFIG } from '../config.js';
import { getDeviceStatus } from '../utils/IsOnline.js';

export async function createOffice(scene) {
    const devices = [];
    const officeGroup = new THREE.Group();
    scene.add(officeGroup);

    const LIGHT_ENTITY_ID = 'light.office';
    const BLIND_ENTITY_ID = 'cover.office_blind';
    const HA_ACCESS_TOKEN = CONFIG.HA_ACCESS_TOKEN;

    // =========================
    // Floor
    // =========================
    const officeShape = new THREE.Shape();
    officeShape.moveTo(13, 10);
    officeShape.lineTo(28, 10);
    officeShape.lineTo(28, 23);
    officeShape.lineTo(18, 23);
    officeShape.lineTo(13, 20);
    officeShape.closePath();

    const extrudePath = new THREE.LineCurve3(
        new THREE.Vector3(0, 0.01, 0),
        new THREE.Vector3(0, 0, 0)
    );
    const extrudeSettings = { steps: 1, extrudePath, bevelEnabled: false };
    const floorGeometry = new THREE.ExtrudeGeometry(officeShape, extrudeSettings);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0 
    });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    officeGroup.add(floorMesh);

    // =========================
    // Light (Modular)
    // =========================
    const wizzLightController = createWizzLight(
        LIGHT_ENTITY_ID,
        officeGroup,
        CONFIG,
        new THREE.Vector3(16, 6, -18)
    );

    // =========================
    // Toggle Light on "O" Key
    // =========================
    // Add pointer-based interaction for the bulb

    wizzLightController.mesh.userData.interactive = true;
    wizzLightController.mesh.userData.onClick = () => {
        console.log("🖱️ Bulb clicked/tapped. Toggling office light...");
        wizzLightController.toggle();
    };
    devices.push(wizzLightController.mesh);

    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "o") {
            console.log("🕹️ 'O' pressed. Toggling office light...");
            wizzLightController.toggle();
        }
    });
    

    // =========================
    // WebSocket for Blinds
    // =========================
    // const BLIND_ENTITY_ID = "cover.office_blind";

    // WebSocket logic stays as-is
    const haSocket = new WebSocket(CONFIG.HA_WEBSOCKET_URL);
    function sendToHASocket(msg) {
        haSocket.send(JSON.stringify(msg));
    }
    haSocket.onopen = () => {
        console.log("✅ Connected to HA WebSocket (office.js)");
        sendToHASocket({ type: "auth", access_token: HA_ACCESS_TOKEN });
        setTimeout(() => {
            sendToHASocket({ id: 1, type: "subscribe_events", event_type: "state_changed" });
            sendToHASocket({ id: 2, type: "get_states" });
        }, 500);
    };

    // Add glass doors (with toggle capability on glass)
    const glassDoor1 = addGlassDoor(
        officeGroup, 14.75, 28, 0, 2.5, 4.5, false, false,
        "cover.office_blind", sendToHASocket,  null
    );
    
    const glassDoor2 = addGlassDoor(
        officeGroup, 17.25, 28, 0, 2.5, 4.5, true, false,
        "cover.office_blind", sendToHASocket,  null
    );
    
    

    // Collect blinds for visual update
    function updateAllBlinds(position, animate = true) {
        glassDoor1.updateBlinds?.(position, animate);
        glassDoor2.updateBlinds?.(position, animate);
    }
    
    haSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.event?.event_type === "state_changed") {
            const entityId = data.event.data.entity_id;
            const newState = data.event.data.new_state;
            if (entityId === "cover.office_blind") {
                updateAllBlinds(newState.attributes.current_position ?? 0);
            }
        }
        if (data.id === 2 && data.result) {
            const blind = data.result.find(e => e.entity_id === "cover.office_blind");
            if (blind) updateAllBlinds(blind.attributes.current_position ?? 0, false);

        }
        
    }
    

    // Register glass panels as interactive devices
    devices.push(glassDoor1.glassPanel);
    devices.push(glassDoor2.glassPanel);



    // =========================
    // Decorative Door
    // =========================
    addDecorativeDoor(officeGroup, 21.25, 15.1, 59, 2, 5);

    // =========================
    // 3D Models (Bookcase)
    // =========================
    function isDesktop() {
        const ua = navigator.userAgent.toLowerCase();
        const isMobile = /android|iphone|ipad|ipod|mobile|tablet/i.test(ua);
        return !isMobile;
      }
    if (true) { // if phone dont work replace true with isDesktop()

    const loader = new GLTFLoader();



    if (isDesktop()) {
    loader.load('/local/HomeSphere/models/bookcase.glb', (gltf) => {
        const bookcase = gltf.scene;
        bookcase.scale.set(8, 2.25, 6);
        bookcase.rotation.y = 0;

        bookcase.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });

        bookcase.position.set(20.75, 2.25, -27.35);
        officeGroup.add(bookcase);
    });

    // Load bookcase 2
    loader.load('/local/HomeSphere/models/bookcase.glb', (gltf) => {
        const bookcase = gltf.scene;
    
        // Mirror across X
        bookcase.scale.set(8, 2.25, 6);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        bookcase.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        bookcase.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position bookcase
        bookcase.position.set(14.5, 2.25, -13.6);
        officeGroup.add(bookcase);
    });


    // Load table
    loader.load('/local/HomeSphere/models/table.glb', (gltf) => {
        const table = gltf.scene;
    
        // Mirror across X
        table.scale.set(2.75, 0.75, 2);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 90;
        table.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        table.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x964B00,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position table
        table.position.set(21.75, 0.35, -22);
        officeGroup.add(table);
    });
    }
        // Load table
        loader.load('/local/HomeSphere/models/table.glb', (gltf) => {
            const table = gltf.scene;
        
            // Mirror across X
            table.scale.set(1.25, 0.75, 2.25);
        
            // Rotate around the Y axis (adjust angle as needed)
            const degrees = 180;
            table.rotation.y = -THREE.MathUtils.degToRad(degrees);
            
            // Override materials so it’s not flat white
            table.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x964B00,
                        roughness: 0.6,
                        metalness: 0
                    });
                }
            });
        
            // Position table
            table.position.set(11.35, 0.35, -14.35);
            officeGroup.add(table);
        });
    
    
        const printer_status = await getDeviceStatus(9);
        // Load printer
        loader.load('/local/HomeSphere/models/printer_low.glb', (gltf) => {
            const printer = gltf.scene;
        
            // Mirror across X
            printer.scale.set(1, 1, 1);
        
            // Rotate around the Y axis (adjust angle as needed)
            const degrees = 0;
            printer.rotation.y = -THREE.MathUtils.degToRad(degrees);
            
        
            // Position printer
            printer.position.set(11.35, 1.3, -14.35);
            officeGroup.add(printer);
    
            if(printer_status.online) {
                const geometry = new THREE.SphereGeometry(0.1, 16, 16);
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(11.35, 1.85, -14.35);
                officeGroup.add(sphere);
            }else{
                
                const geometry = new THREE.SphereGeometry(0.1, 16, 16);
                const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(11.35, 1.85, -14.35);
                officeGroup.add(sphere);
            }
        });

    // Load desk part 1
    loader.load('/local/HomeSphere/models/desk.glb', (gltf) => {
        const office_desk = gltf.scene;
    
        // Mirror across X
        office_desk.scale.set(2.5, 3.5, 1.75);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 90;
        office_desk.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        office_desk.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position office_desk
        office_desk.position.set(15, 1.2, -22);
        officeGroup.add(office_desk);
    });

    // Load desk part 2
    loader.load('/local/HomeSphere/models/desk.glb', (gltf) => {
        const office_desk = gltf.scene;
    
        // Mirror across X
        office_desk.scale.set(1.25, 3.25, 1.0);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 0;
        office_desk.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        office_desk.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position office_desk
        office_desk.position.set(13, 1.0, -20.5);
        officeGroup.add(office_desk);
    });

    // Load desk monitor
    loader.load('/local/HomeSphere/models/monitor.glb', (gltf) => {
        const monitor = gltf.scene;
    
        // Mirror across X
        monitor.scale.set(0.4, 0.75, 0.75);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        monitor.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        monitor.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position monitor
        monitor.position.set(15.75, 2.9, -22.65);
        officeGroup.add(monitor);
    });

    // load pc_tower.glb
    const pc_tower_status = await getDeviceStatus(23);
    const pc_tower_cable_status = await getDeviceStatus(30);
    loader.load('/local/HomeSphere/models/pc_tower.glb', (gltf) => {
        const pc_tower = gltf.scene;
    
        // Mirror across X
        pc_tower.scale.set(0.75, 0.75, 0.75);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        pc_tower.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        pc_tower.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position pc_tower
        pc_tower.position.set(15.35, 0.8, -23.85);
        officeGroup.add(pc_tower);

        if(pc_tower_status.online) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(14.8, 1.4, -23.7);
            officeGroup.add(sphere);
        }else if (pc_tower_cable_status.online) {
            
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(14.8, 1.4, -23.7);
            officeGroup.add(sphere);
        }else {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(14.8, 1.4, -23.7);
            officeGroup.add(sphere);
        }

    });

    // Load desk chair
    loader.load('/local/HomeSphere/models/gaming_chair.glb', (gltf) => {
        const monitor = gltf.scene;
    
        // Mirror across X
        monitor.scale.set(2.25, 2.25, 2.25);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 270;
        monitor.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
    
        // Position monitor
        monitor.position.set(12.5, 2.2, -22.75);
        officeGroup.add(monitor);
    });

    // load opaplaptop
    const opaplaptop_status = await getDeviceStatus(24);
    if(opaplaptop_status.online) {
    loader.load('/local/HomeSphere/models/laptop.glb', (gltf) => {
        const laptop = gltf.scene;
    
        // Mirror across X
        laptop.scale.set(0.5,0.5,0.5);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 320;
        laptop.rotation.y = THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        laptop.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position laptop
        laptop.position.set(15.35, 2.7, -23.85);
        officeGroup.add(laptop);
    });
    }



    // load laptop
    const macbook_status = await getDeviceStatus(22);
    if(macbook_status.online) {
    loader.load('/local/HomeSphere/models/laptop.glb', (gltf) => {
        const laptop = gltf.scene;
    
        // Mirror across X
        laptop.scale.set(0.5,0.5,0.5);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = -90;
        laptop.rotation.y = THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        laptop.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xcecece,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position laptop
        laptop.position.set(14.7, 2.7, -22.5);
        officeGroup.add(laptop);
    });
    }


    // load laptop
    const enialios_status = await getDeviceStatus(29);
    if(enialios_status.online) {
    loader.load('/local/HomeSphere/models/laptop.glb', (gltf) => {
        const laptop = gltf.scene;
    
        // Mirror across X
        laptop.scale.set(0.5,0.5,0.5);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 0;
        laptop.rotation.y = THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        laptop.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xcecece,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position laptop
        laptop.position.set(12.5, 2.5, -20.75);
        officeGroup.add(laptop);
    });
    }
    }
    return { devices };
}
