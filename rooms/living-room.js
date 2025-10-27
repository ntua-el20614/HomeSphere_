import * as THREE from '/local/HomeSphere/three/build/three.module.js'
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { CONFIG } from '../config.js';
import { addGlassDoor } from '../utils/GlassDoor.js';
import { getDeviceStatus } from '../utils/IsOnline.js';
import { listenToVacuumStatus } from '../utils/Vacuum.js';
export async function createLivingRoom(scene) {
    const devices = [];
    const livingroomGroup = new THREE.Group();
    scene.add(livingroomGroup);
    
    const loader = new GLTFLoader();




    const tv_status = await getDeviceStatus(14);
    // Load TV
    loader.load('/local/HomeSphere/models/tv.glb', (gltf) => {
        const tv = gltf.scene;
    
        // Mirror across X
        tv.scale.set(2.75, 1.75, 1.75);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 0;
        tv.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        tv.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position tv
        tv.position.set(23.1, 4, -22);
        livingroomGroup.add(tv);
        //if its online create a green sphere
        if(tv_status.online){
            const geometry = new THREE.SphereGeometry(0.1, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(23.15, 2.9, -23.35);
            livingroomGroup.add(sphere);
        }else{
            const geometry = new THREE.SphereGeometry(0.1, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(23.15, 2.9, -23.35);
            livingroomGroup.add(sphere);
        }
    });    

    function isDesktop() {
        const ua = navigator.userAgent.toLowerCase();
        const isMobile = /android|iphone|ipad|ipod|mobile|tablet/i.test(ua);
        return !isMobile;
      }

      const ps4_status = await getDeviceStatus(15);
      // Load ps4
      loader.load('/local/HomeSphere/models/ps4_ready.glb', (gltf) => {
          const ps4 = gltf.scene;
  
          ps4.scale.set(1.25, 1.25, 1.25);
      
          // Rotate around the Y axis (adjust angle as needed)
          const degrees = 0;
          ps4.rotation.y = -THREE.MathUtils.degToRad(degrees);
          
          // Override materials so it’s not flat white
  
  
  
          
          if(ps4_status.online){
              const geometry = new THREE.SphereGeometry(0.1, 32, 32);
              const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
              const sphere = new THREE.Mesh(geometry, material);
              sphere.position.set(24, 2, -23.75);
              livingroomGroup.add(sphere);
          }else{
  
              ps4.traverse((child) => {
                  if (child.isMesh) {
                      child.material = new THREE.MeshStandardMaterial({
                          color: 0x121212,
                          roughness: 0.6,
                          metalness: 0
                      });
                  }
              });
          }
  
  
          // Position ps4
          ps4.position.set(24, 1.85, -23.75);
          livingroomGroup.add(ps4);
      });
  
    // Load Desk
    loader.load('/local/HomeSphere/models/livingroom_desk.glb', (gltf) => {
        const desk = gltf.scene;
    
        // Mirror across X
        desk.scale.set(2.75, 1.75, 1.75);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 90;
        desk.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        desk.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position desk
        desk.position.set(24, 0.5, -22);
        livingroomGroup.add(desk);
    });

    if (isDesktop()) {



    // Load Sofa
    loader.load('/local/HomeSphere/models/sofa.glb', (gltf) => {
        const sofa = gltf.scene;
    
        // Mirror across X
        sofa.scale.set(-5.7, 4.5, 3.15);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 111;
        sofa.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        sofa.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x666666,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position sofa
        sofa.position.set(32.5, 1.5, -18.75);
        livingroomGroup.add(sofa);
    });
    


    const alexa_status = await getDeviceStatus(16);
    // Load alexa
    loader.load('/local/HomeSphere/models/alexa.glb', (gltf) => {
        const alexa = gltf.scene;

        alexa.scale.set(0.35, 0.35, 0.35);
    
        // Rotate around the Y axis (adjust angle as needed)
        const degrees = 0;
        alexa.rotation.y = -THREE.MathUtils.degToRad(degrees);
        
        // Override materials so it’s not flat white
        alexa.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x121212,
                    roughness: 0.6,
                    metalness: 0
                });
            }
        });
    
        // Position alexa
        alexa.position.set(23.6, 1.85, -19.8);
        livingroomGroup.add(alexa);

        //if online create a circle on top of it
        if(alexa_status.online){
            const geometry = new THREE.TorusGeometry(0.18, 0.05, 32, 100); // (radius, tube radius, radial segments, tubular segments)
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const ring = new THREE.Mesh(geometry, material);
            ring.position.set(23.6, 2.15, -19.8);
            ring.rotation.x = -THREE.MathUtils.degToRad(90);
            livingroomGroup.add(ring);
            
        }else{
            const geometry = new THREE.TorusGeometry(0.18, 0.05, 32, 100); // (radius, tube radius, radial segments, tubular segments)
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const ring = new THREE.Mesh(geometry, material);
            ring.position.set(23.6, 2.15, -19.8);
            ring.rotation.x = -THREE.MathUtils.degToRad(90);
            livingroomGroup.add(ring);
            
        }
    });




        // Load Vacuum
        loader.load('/local/HomeSphere/models/vacuum.glb', (gltf) => {
            const vacuum = gltf.scene;
        
            // Mirror across X
            vacuum.scale.set(0.5, 0.5, 0.5);
        
            // Rotate around the Y axis (adjust angle as needed)
            const degrees = 180;
            vacuum.rotation.y = -THREE.MathUtils.degToRad(degrees);
                
            // Position vacuum
            listenToVacuumStatus(CONFIG, ({ status, attributes }) => {
                // status: "sweeping", "go charging", "charging", "paused"
                console.log("🧹 Vacuum Status:", status);
                if(status === "charging" || status === "go charging"){
                vacuum.position.set(27.1, 0.1, -13.5);
                }
                else if(status === "sweeping" || status === "paused"){
                    vacuum.position.set(28, 0.1, -20);
                }
            });
            livingroomGroup.add(vacuum);
        });
    }


    //*/

    // Home Assistant WebSocket Configuration
    const haSocket = new WebSocket(CONFIG.HA_WEBSOCKET_URL);
    const HA_ACCESS_TOKEN = CONFIG.HA_ACCESS_TOKEN;
    // =========================================================
    // 1) Living Room Glass Door
    // =========================================================

    
    const LIVING_ROOM_BLIND_ENTITY_ID = "cover.living_room_blind";

    const glassDoor1 = addGlassDoor(
        livingroomGroup, 24.75, 26, 0, 2.5, 4.5, false, false,
        LIVING_ROOM_BLIND_ENTITY_ID, sendToHASocket, null
    );

    const glassDoor2 = addGlassDoor(
        livingroomGroup, 27.25, 26, 0, 2.5, 4.5, true, false,
        LIVING_ROOM_BLIND_ENTITY_ID, sendToHASocket, null
    );

    function updateAllBlinds(position, animate = true) {
        glassDoor1.updateBlinds?.(position, animate);
        glassDoor2.updateBlinds?.(position, animate);
    }

    function sendToHASocket(message) {
        haSocket.send(JSON.stringify(message));
    }

    haSocket.onopen = () => {
        console.log("✅ Connected to HA WebSocket (livingroom.js)");

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

            if (entityId === LIVING_ROOM_BLIND_ENTITY_ID) {
                updateAllBlinds(newState.attributes.current_position ?? 0);
            }
        }

        if (data.id === 2 && data.result) {
            const blindState = data.result.find(e => e.entity_id === LIVING_ROOM_BLIND_ENTITY_ID);
            if (blindState) updateAllBlinds(blindState.attributes.current_position ?? 0, false);
        }
    };

    devices.push(glassDoor1.glassPanel);
    devices.push(glassDoor2.glassPanel);



    return { devices };
}
