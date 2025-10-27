import * as THREE from '/local/HomeSphere/three/build/three.module.js';
import { OrbitControls } from '/local/HomeSphere/three/examples/jsm/controls/OrbitControls.js';

// Import rooms
import { createBedroom } from './rooms/bedroom.js';
import { createOffice } from './rooms/office.js';
import { createLivingRoom } from './rooms/living-room.js';
import { createKitchen } from './rooms/kitchen.js';
import { createBathroom } from './rooms/bathroom.js';
import { createBalcony } from './rooms/balcony.js';
import { createApartment } from './rooms/apartment.js';
import { createPeople } from './people/people.js';

(async function init() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Detect time of day and set background color
    function updateBackground() {
        let currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 8) {
            scene.background = new THREE.Color(0x01004d);
        } else if (currentHour >= 8 && currentHour < 19) {
            scene.background = new THREE.Color(0x71BCE1);
        } else if (currentHour >= 19 && currentHour < 21) {
            scene.background = new THREE.Color(0x01004d);
        } else if (currentHour >= 21 || currentHour < 5) {
            scene.background = new THREE.Color(0x0a0a0a);
        }
    }

    updateBackground();

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambientLight);

    camera.position.set(25, 20, -30);
    const lookat = new THREE.Vector3(20, 0, -13);
    controls.target.set(lookat.x, lookat.y, lookat.z);
    camera.lookAt(lookat.x, lookat.y, lookat.z);
    controls.update();

    let allDevices = [];

    const apartment = createApartment(scene);
    allDevices = allDevices.concat(apartment.devices);

    const bedroom = await createBedroom(scene);
    allDevices = allDevices.concat(bedroom.devices);

    const office = await createOffice(scene);
    allDevices = allDevices.concat(office.devices);

    const livingRoom = await createLivingRoom(scene);
    allDevices = allDevices.concat(livingRoom.devices);

    const kitchen = await createKitchen(scene);
    allDevices = allDevices.concat(kitchen.devices);

    const bathroom = await createBathroom(scene);
    allDevices = allDevices.concat(bathroom.devices);

    const balcony = await createBalcony(scene);
    allDevices = allDevices.concat(balcony.devices);

    const people = await createPeople(scene);
    allDevices = allDevices.concat(people.devices);

    console.log("📦 All Devices:", allDevices);
    console.log("📦 Valid Devices:", allDevices.filter(obj => obj && obj.isObject3D));
    console.log("✅ Total devices collected:", allDevices.length);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('pointerdown', (event) => {
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(pointer, camera);

        const validDevices = allDevices.filter(obj => obj && obj.isObject3D);
        if (validDevices.length === 0) {
            console.warn("⚠️ No valid devices for raycasting.");
            return;
        }

        const intersects = raycaster.intersectObjects(validDevices, true);
        if (intersects.length === 0) {
            console.log("📡 Raycast fired — no intersections.");
            return;
        }

        const hit = intersects[0].object;
        console.log("✅ Raycast hit:", hit.name || hit.type || hit.uuid);

        let target = hit;
        while (target && !target.userData?.interactive) {
            target = target.parent;
        }

        if (!target) {
            console.log("🔍 Hit object is not interactive.");
            return;
        }

        if (typeof target.userData.onClick === "function") {
            console.log("🎯 Calling onClick for:", target);
            target.userData.onClick();
        } else {
            console.log("🚫 interactive object has no onClick function.");
        }
    });

})();
