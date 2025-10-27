// rooms/kitchen.js
import * as THREE from '/local/HomeSphere/three/build/three.module.js'
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { addGlassWindow } from '../utils/Window.js';
import { addDecorativeDoor } from '../utils/Door.js'
import { getDeviceStatus } from '../utils/IsOnline.js'; // Import function

export async function createKitchen(scene) {
    const devices = [];
    const loader = new GLTFLoader();
    
    function isDesktop() {
        const ua = navigator.userAgent.toLowerCase();
        const isMobile = /android|iphone|ipad|ipod|mobile|tablet/i.test(ua);
        return !isMobile;
      }

    // Fetch devices asynchronously
    // const onlineDevices = await getOnlineDevices();
    // console.log("Online Devices in Kitchen Scene:", onlineDevices); // Log them to verify
    
    function createCounterFromPoints(p1, p2, p3, p4) {
        // Create a rectangle based on the given 4 points
        const width = Math.abs(p1[0] - p2[0]);
        const depth = Math.abs(p1[2] - p3[2]);
        const height = p1[1]; // Height is based on the first point
        // Create geometry for the counter surface
        const counterGeometry = new THREE.BoxGeometry(width, 0.2, depth); // 0.2 is the height (thickness) of the counter

        // Material for the counter (white color)
        const counterMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

        // Create the mesh for the counter
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);

        // Position the counter at the correct location based on the 4 points
        const centerX = (p1[0] + p2[0]) / 2;
        const centerZ = (p1[2] + p3[2]) / 2;
        counter.position.set(centerX, height, centerZ); // Positioned above the floor at 0.1 (adjustable)

        kitchenGroup.add(counter);
    }

        const kitchenGroup = new THREE.Group();
        scene.add(kitchenGroup);
    
        // =========================================================
        // 1) kitchen Floor
        // =========================================================
        // We start with five edge points given in the format [x, 0, -z]:
        /*
        { position: [0,0,-3], color: "red"},
        { position: [13,0,-3], color: "red"},
        { position: [13,0,0], color: "red"},
        { position: [25,0,0], color: "red"},
        { position: [25,0,-9], color: "red"},
        { position: [20,0,-13], color: "red"},
        { position: [0,0,-13], color: "red"},
        */
        // Conversion rule: for each point [x, 0, -z], use (|z|, x) to define the 2D floor shape.
        // This yields:
        //
        //              -- wont die typing --
        //              -- look at office --
        //
        // We then create a 2D shape (in the x-z plane) using these converted points.
        // Finally, we extrude the shape upward by 0.01 units so that the top surface of the floor is raised 1 cm.
        // (The extrusion is defined from y = 0.01 down to y = 0, so the top is at y = 0.01.)
        // =========================================================
        const kitchenShape = new THREE.Shape();
        kitchenShape.moveTo(3, 0);
        kitchenShape.lineTo(3, 13);
        kitchenShape.lineTo(0, 13);
        kitchenShape.lineTo(0, 25);
        kitchenShape.lineTo(9, 25);
        kitchenShape.lineTo(13, 20);
        kitchenShape.lineTo(13, 0);
        
        kitchenShape.closePath();
    
        // Extrusion: we use a LineCurve3 to define a small vertical extrusion
        // that lifts the top of the floor to y = 0.01.
        const extrudePath = new THREE.LineCurve3(
            new THREE.Vector3(0, 0.01, 0), // starting at top (y = 0.01)
            new THREE.Vector3(0, 0, 0)       // ending at bottom (y = 0)
        );
        const extrudeSettings = {
            steps: 1,
            extrudePath: extrudePath,
            bevelEnabled: false
        };
        const kitchenFloorGeometry = new THREE.ExtrudeGeometry(kitchenShape, extrudeSettings);
        const kitchenFloorMaterial = new THREE.MeshPhongMaterial({
            color: 0xf5f5dc,
            side: THREE.DoubleSide
        });
        const kitchenFloorMesh = new THREE.Mesh(kitchenFloorGeometry, kitchenFloorMaterial);
        kitchenGroup.add(kitchenFloorMesh);
    
    // =========================================================
    // 2) Entrance Door
    // =========================================================
    addDecorativeDoor(kitchenGroup, 0, 6.5, 90, 3, 5);

    // =========================================================
    // 3) Window
    // =========================================================
    // addGlassWindow(livingroomGroup, x, z, distanceFromFloor, width, height, 'lightblue', { x: Math.PI / 4, y: 0, z: 0 });
    const currentHour = new Date().getHours();
    const windowColor = (currentHour >= 8 && currentHour < 20) ? 'lightblue' : 'black';
    addGlassWindow(kitchenGroup, 25, 1.5, 7, 1.5, 2.5, windowColor, { x:0 ,y: -Math.PI / 2, z: 0 });
    addGlassWindow(kitchenGroup, 14.5, 0, 7, 1.5, 2.5, windowColor, { x:0 ,y: 0, z: 0 });

    // =========================================================
    // 4) Kitchen Cabinets
    // =========================================================
    if (isDesktop()) {


    loader.load('/local/HomeSphere/models/oven.glb', (gltf) => {
        const oven = gltf.scene;

        // Mirror across X
        oven.scale.set(1.25,1.25,1.1);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 90;
        oven.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        oven.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position oven
        oven.position.set(24, 2.15, -7.95);
        kitchenGroup.add(oven);
    });
    
    loader.load('/local/HomeSphere/models/solo_cub.glb', (gltf) => {
        const kitchenCabinets = gltf.scene;

        // Mirror across X
        kitchenCabinets.scale.set(1.75, 1, 1.75);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        kitchenCabinets.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        kitchenCabinets.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x964B00,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position kitchenCabinets
        kitchenCabinets.position.set(14.5, 1, -1.5);
        kitchenGroup.add(kitchenCabinets);
    });

    loader.load('/local/HomeSphere/models/duo_cub.glb', (gltf) => {
        const kitchenCabinets = gltf.scene;

        // Mirror across X
        kitchenCabinets.scale.set(2,1.5,2);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        kitchenCabinets.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        kitchenCabinets.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position kitchenCabinets
        kitchenCabinets.position.set(18, 5, -0.9);
        kitchenGroup.add(kitchenCabinets);
    });
    
    loader.load('/local/HomeSphere/models/duo_cub.glb', (gltf) => {
        const kitchenCabinets = gltf.scene;

        // Mirror across X
        kitchenCabinets.scale.set(2,1.5,2);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        kitchenCabinets.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        kitchenCabinets.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position kitchenCabinets
        kitchenCabinets.position.set(20, 5, -0.9);
        kitchenGroup.add(kitchenCabinets);
    });

    loader.load('/local/HomeSphere/models/duo_cub.glb', (gltf) => {
        const kitchenCabinets = gltf.scene;

        // Mirror across X
        kitchenCabinets.scale.set(1.75,1.75,3.5);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        kitchenCabinets.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        kitchenCabinets.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x964B00,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position kitchenCabinets
        kitchenCabinets.position.set(19.5, 1, -1.5);
        kitchenGroup.add(kitchenCabinets);
    });

    loader.load('/local/HomeSphere/models/duo_cub.glb', (gltf) => {
        const kitchenCabinets = gltf.scene;

        // Mirror across X
        kitchenCabinets.scale.set(2.5,1.75,3);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 90;
        kitchenCabinets.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        kitchenCabinets.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x964B00,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position kitchenCabinets
        kitchenCabinets.position.set(23.7, 1, -2.5);
        kitchenGroup.add(kitchenCabinets);
    });

    loader.load('/local/HomeSphere/models/duo_cub.glb', (gltf) => {
        const kitchenCabinets = gltf.scene;

        // Mirror across X
        kitchenCabinets.scale.set(3,1.75,3.5);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        kitchenCabinets.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        kitchenCabinets.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x964B00,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position kitchenCabinets
        kitchenCabinets.position.set(21, 1, -1.5);
        kitchenGroup.add(kitchenCabinets);
    });



    loader.load('/local/HomeSphere/models/kitchen_table.glb', (gltf) => {
        const kitchen_table = gltf.scene;

        // Mirror across X
        kitchen_table.scale.set(2,1.25,2.5);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 90;
        kitchen_table.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        kitchen_table.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xdbdbdb,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position kitchen_table
        kitchen_table.position.set(15, 1, -11);
        kitchenGroup.add(kitchen_table);
    });

    loader.load('/local/HomeSphere/models/stool_modem.glb', (gltf) => {
        const stool_modem = gltf.scene;

        // Mirror across X
        stool_modem.scale.set(1.75,0.75,1.75);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        stool_modem.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        stool_modem.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x853a00,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position stool_modem
        stool_modem.position.set(11.75, 0.8, -4);
        kitchenGroup.add(stool_modem);
    });

    const modem_status = await getDeviceStatus(200);
    loader.load('/local/HomeSphere/models/modem.glb', (gltf) => {
        const modem = gltf.scene;

        // Mirror across X
        modem.scale.set(0.75,0.75,0.75);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        modem.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        modem.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position modem
        modem.position.set(11.75, 2.05, -4);
        kitchenGroup.add(modem);

        //if modem is online create a small sphere above it
        if (modem_status.online) {
            const geometry = new THREE.SphereGeometry(0.1, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(11.75, 1.9, -4.4);
            kitchenGroup.add(sphere);
        }else{
            const geometry = new THREE.SphereGeometry(0.1, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(11.75, 1.9, -4.4);
            kitchenGroup.add(sphere);
        }
    });


    loader.load('/local/HomeSphere/models/solo_cub.glb', (gltf) => {
        const kitchenCabinets = gltf.scene;

        // Mirror across X
        kitchenCabinets.scale.set(1.35,0.75,1.1);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 90;
        kitchenCabinets.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        kitchenCabinets.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position kitchenCabinets
        kitchenCabinets.position.set(24, 0.65, -7.9);
        kitchenGroup.add(kitchenCabinets);
    });

    loader.load('/local/HomeSphere/models/washing_machine.glb', (gltf) => {
        const washingMachine = gltf.scene;

        // Mirror across X
        washingMachine.scale.set(1.35,1,2.5);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        washingMachine.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        washingMachine.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position washingMachine
        washingMachine.position.set(16.8, 1, -2.5);
        kitchenGroup.add(washingMachine);
    });

    
    loader.load('/local/HomeSphere/models/fridge.glb', (gltf) => {
        const fridge = gltf.scene;

        // Mirror across X
        fridge.scale.set(1.7,1.75,2.4);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 90;
        fridge.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        fridge.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xdedede,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position fridge
        fridge.position.set(23.7, 1.65, -6);
        kitchenGroup.add(fridge);
    });


    loader.load('/local/HomeSphere/models/sink.glb', (gltf) => {
        const sink = gltf.scene;

        // Mirror across X
        sink.scale.set(1.25, 1, 1.25);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        sink.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        sink.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position sink
        sink.position.set(14.5, 2.75, -1.65);
        kitchenGroup.add(sink);
    });

    loader.load('/local/HomeSphere/models/stove.glb', (gltf) => {
        const stove = gltf.scene;

        // Mirror across X
        stove.scale.set(1.25, 1, 1.25);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        stove.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        stove.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position stove
        stove.position.set(20.25, 2.15, -1.65);
        kitchenGroup.add(stove);
    });

    const nespresso_status = await getDeviceStatus(13);
    loader.load('/local/HomeSphere/models/nespresso.glb', (gltf) => {
        const nespresso = gltf.scene;

        // Mirror across X
        nespresso.scale.set(0.75, 0.75, 0.75);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 145;
        nespresso.rotation.y = -THREE.MathUtils.degToRad(degrees);

    
        // Position nespresso
        nespresso.position.set(23.5, 2.75, -1.65);
        kitchenGroup.add(nespresso);


        //if nespresso is online create a small sphere above it
        if (nespresso_status.online) {
            const geometry = new THREE.SphereGeometry(0.1, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(23.5, 3.4, -1.65);
            kitchenGroup.add(sphere);
        }else{
            const geometry = new THREE.SphereGeometry(0.1, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(23.5, 3.4, -1.65);
            kitchenGroup.add(sphere);
        }


    });
    
    const camera_status = await getDeviceStatus(11);
    loader.load('/local/HomeSphere/models/camera.glb', (gltf) => {
        const camera = gltf.scene;

        // Mirror across X
        camera.scale.set(0.25, 0.25, 0.25);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 180;
        camera.rotation.y = -THREE.MathUtils.degToRad(degrees);
    
        // Position camera
        camera.position.set(23.5, 3.85, -8.5);

        // Change material color based on online status
        camera.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: camera_status.online ? 0xffffff : 0x121212, // White if online, gray if not
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });

        kitchenGroup.add(camera);
    });

    // Load Wardrobes
    
    loader.load('/local/HomeSphere/models/small_wardrobe.glb', (gltf) => {
        const wardrobe = gltf.scene;
        const degrees = 0;
        wardrobe.rotation.y = THREE.MathUtils.degToRad(degrees);
        wardrobe.scale.set(4, 3, 4);
        wardrobe.position.set(1.15, 3, -11.75);
        const distance = 2.125;
        // White material
        wardrobe.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Add original wardrobe
        kitchenGroup.add(wardrobe);
    
        // Clone #1 - identical on the right
        const wardrobe1 = wardrobe.clone();
        wardrobe1.position.x += distance; // shift right
        kitchenGroup.add(wardrobe1);
    
        // Clone #2 - flipped
        const wardrobe2 = wardrobe.clone();
        wardrobe2.position.x += distance * 2;
        wardrobe2.scale.set(-4, 3, 4);
        kitchenGroup.add(wardrobe2);
    
        // Clone #3 - flipped
        const wardrobe3 = wardrobe.clone();
        wardrobe3.position.x += distance * 3;
        wardrobe3.scale.set(-4, 3, 4);
        kitchenGroup.add(wardrobe3);
        
    });
    
    

    }

    createCounterFromPoints(
        [25, 2, 0],
        [13, 2, 0],
        [13, 2, -3],
        [25, 2, -3]
    );
    createCounterFromPoints(
        [25, 2, 0],
        [22.25, 2, 0],
        [22.25, 2,-5],
        [25, 2,-5]
    );
    createCounterFromPoints(
        [25, 3.5,-5],
        [23, 3.5,-5],
        [23, 3.5,-9],
        [25, 3.5,-9]
    );


    return { devices };
}
