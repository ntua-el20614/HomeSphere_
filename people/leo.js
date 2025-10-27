import * as THREE from '../three/build/three.module.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { getDeviceStatus } from '../utils/IsOnline.js'; // Assuming it exists here

export async function leo(scene) {
    const devices = [];
    const leoGroup = new THREE.Group();
    scene.add(leoGroup);

    const loader = new GLTFLoader();
    // if leo is home
    const leo_status_phone = await getDeviceStatus(28);
    const leo_status_enialios = await getDeviceStatus(29);
    if(leo_status_phone.online || leo_status_enialios.online){

        loader.load('../models/people/leo.glb', (gltf) => {
            const leo = gltf.scene;
            leo.scale.set(2.5, 2.5, 2.5);
    

            if(leo_status_phone.online && !leo_status_enialios.online){
            const degrees = 275;
            leo.rotation.y = -THREE.MathUtils.degToRad(degrees);
            leo.position.set(27,2.5, -18);
            }else 
            if(leo_status_enialios.online){
                const degrees = 200;
                leo.rotation.y = -THREE.MathUtils.degToRad(degrees);
                leo.position.set(13,2.5, -19);
            }
            
            
            leoGroup.add(leo);

          });
               
    }

    return { devices };
}
