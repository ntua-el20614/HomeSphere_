// rooms/bathroom.js
import * as THREE from '/local/HomeSphere/three/build/three.module.js'
import { addDecorativeDoor } from '../utils/Door.js';
import { CONFIG } from '../config.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { createWizzLight } from '../utils/wizzLight.js';
// import { metalness, roughness } from 'three/tsl';

export function createBathroom(scene) {
    const devices = [];
    
    const bathroomGroup = new THREE.Group();
    scene.add(bathroomGroup);

    const LIGHT_ENTITY_ID = 'light.bathroom1';
    const HA_ACCESS_TOKEN = CONFIG.HA_ACCESS_TOKEN;
    // =========================================================
    // 1) bathroom Floor
    // =========================================================
    // We start with five edge points given in the format [x, 0, -z]:
    /*
            { position: [25,0,-9], color: "red"},
            { position: [28,0,-14], color: "red"},
            { position: [32.85,0,-12.5], color: "red"},
            { position: [29.15,0,-3], color: "red"},
            { position: [25,0,-3], color: "red"},
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
    const bathroomShape = new THREE.Shape();
    bathroomShape.moveTo(9, 25);
    bathroomShape.lineTo(14, 28);
    bathroomShape.lineTo(12.5, 32.85);
    bathroomShape.lineTo(3, 29.15);
    bathroomShape.lineTo(3, 25);
    
    bathroomShape.closePath();

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

    const textureLoader = new THREE.TextureLoader();
    const ceramicTexture = textureLoader.load('models/floor/ceramic.jpg');
    // Tile the texture more (20×20) so planks look smaller
    ceramicTexture.wrapS = THREE.RepeatWrapping;
    ceramicTexture.wrapT = THREE.RepeatWrapping;
    ceramicTexture.repeat.set(0.1,0.1);

    const bathroomFloorGeometry = new THREE.ExtrudeGeometry(bathroomShape, extrudeSettings);
    const bathroomFloorMaterial = new THREE.MeshPhongMaterial({
        map: ceramicTexture,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    const bathroomFloorMesh = new THREE.Mesh(bathroomFloorGeometry, bathroomFloorMaterial);
    bathroomGroup.add(bathroomFloorMesh);

    // =========================
    // Light (Modular)
    // =========================
    const wizzLightController = createWizzLight(
        LIGHT_ENTITY_ID,
        bathroomGroup,
        CONFIG,
        new THREE.Vector3(30, 5, -12)
    )//,position = { x: 16, y: 6, z: -18 });

    // =========================
    // Light Toggle on Keypress
    // =========================
    wizzLightController.mesh.userData.interactive = true;
    wizzLightController.mesh.userData.onClick = () => {
        console.log("🖱️ Bulb clicked/tapped. Toggling bathroom light...");
        wizzLightController.toggle();
    };
    devices.push(wizzLightController.mesh);

    window.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "t") {
            console.log("🕹️ 'T' key pressed! Toggling bedroom light...");
            wizzLightController.toggle();
        }
    });


    // =========================================================
    // 2) Bathroom Door
    // =========================================================
    //{ position: [26.8, 0,-12], color: "blue"},
    addDecorativeDoor(bathroomGroup, 26.8, 12, 58.25,2 ,5);
    
    const loader = new GLTFLoader();

    function isDesktop() {
        const ua = navigator.userAgent.toLowerCase();
        const isMobile = /android|iphone|ipad|ipod|mobile|tablet/i.test(ua);
        return !isMobile;
      }
    if (isDesktop()) {

    loader.load('/local/HomeSphere/models/bathroom_sink.glb', (gltf) => {
        const model = gltf.scene;
        const degrees = 342.5;
        model.rotation.y = THREE.MathUtils.degToRad(degrees);
        model.position.set(30, 1.75, -12.6);
        model.scale.set(-2, 2, 2);
        //make it white
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xdfdfdf,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
        bathroomGroup.add(model);
    });

    loader.load('/local/HomeSphere/models/toilet.glb', (gltf) => {
        const toilet = gltf.scene;
        const degrees = 160;
        toilet.rotation.y = THREE.MathUtils.degToRad(degrees);
        toilet.position.set(30.75, 1, -9.75);
        toilet.scale.set(1, 1, 1);

        bathroomGroup.add(toilet);
    });

    loader.load('/local/HomeSphere/models/clothes_machine.glb', (gltf) => {
        const machine = gltf.scene;
        const degrees = 237.5;
        machine.rotation.y = THREE.MathUtils.degToRad(degrees);
        machine.position.set(26, 1, -9.3);
        machine.scale.set(1, 1, 1);

        bathroomGroup.add(machine);
    }
    );
    

    loader.load('/local/HomeSphere/models/showerhead.glb', (gltf) => {
        const showerhead = gltf.scene;
        const degrees = 0;
        showerhead.rotation.y = THREE.MathUtils.degToRad(degrees);
        showerhead.position.set(26, 5, -5);
        showerhead.scale.set(1, 0.5, 1);

        bathroomGroup.add(showerhead);
    }
    );


    {
        // Compute the difference and midpoint between the two points
        const x1 = 27.15, z1 = -6.2;
        const x2 = 30.4, z2 = -7.2;
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx);
        
        // Midpoint for positioning
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        
        // Door size
        const doorHeight = 5;      // about 2.2 meters high
        const doorThickness = 0.05;  // thin door
        
        // Create the geometry & material
        const doorGeometry = new THREE.BoxGeometry(length, doorHeight, doorThickness);
        const doorMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            metalness: 0,
            roughness: 0,
            transmission: 1.0,
            thickness: 0.1,
            ior: 1.5,
            transparent: true,
            opacity: 1.0
        });
        

        const slidingDoor = new THREE.Mesh(doorGeometry, doorMaterial);

        // Place the door so its bottom sits on the floor (y=0)
        // That means you want to shift it upward by half its height:
        slidingDoor.position.set(midX, doorHeight / 2, midZ);
        
        // Rotate so it aligns with the line between the two points
        slidingDoor.rotation.y = angle;

        // Finally, add to the bathroom group
        bathroomGroup.add(slidingDoor);
    }


}
    
    return { devices };
    }
    