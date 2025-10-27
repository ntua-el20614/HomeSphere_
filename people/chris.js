import * as THREE from '../three/build/three.module.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { getDeviceStatus } from '../utils/IsOnline.js'; // Assuming it exists here

export async function chris(scene) {
    const devices = [];
    const chrisGroup = new THREE.Group();
    scene.add(chrisGroup);

    const loader = new GLTFLoader();
    // const chris_status_mac = await getDeviceStatus(22);
    const chris_status_phone = await getDeviceStatus(18);
    const chris_status_ethernet = await getDeviceStatus(30);
    const chris_status_pc = await getDeviceStatus(23);
    console.log(chris_status_phone.online, chris_status_ethernet.online, chris_status_pc.online);
    if (chris_status_phone.online || chris_status_ethernet.online) {
        await new Promise((resolve) => {
            loader.load('../models/people/chris.glb', (gltf) => {
                const model = gltf.scene;
                model.scale.set(2.5, 2.5, 2.5);
                
                
                if(chris_status_ethernet.online || chris_status_pc.online){
                model.rotation.y = -THREE.MathUtils.degToRad(270);
                model.position.set(12.5, 2, -22.5);
                }else{
                model.rotation.y = -THREE.MathUtils.degToRad(30);
                model.position.set(30, 2.5, -19.8);
                }
                
                chrisGroup.add(model);
                resolve();
            });
        });
    }

    return { devices };
}
