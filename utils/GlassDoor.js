import * as THREE from '/../../three/build/three.module.js';

export function addGlassDoor(group, x, z, angle = 0, width = 3, height = 6, right = true, bottom = false, blindEntityId, sendToHASocket, initialPosition = null){

    const doorGroup = new THREE.Group();
    const borderFraction = 0.25;

    const a = 4;
    const b = -2 * (width + height);
    const c = borderFraction * width * height;
    const discriminant = Math.sqrt(b * b - 4 * a * c);
    const frameThickness = ((-b) - discriminant) / (2 * a);

    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0xfefefe });
    const doorFrame = new THREE.Group();

    const topGeometry = new THREE.BoxGeometry(width, frameThickness, frameThickness);
    const topMesh = new THREE.Mesh(topGeometry, frameMaterial);
    topMesh.position.set(0, height / 2 - frameThickness / 2, 0);
    doorFrame.add(topMesh);

    const bottomGeometry = new THREE.BoxGeometry(width, frameThickness, frameThickness);
    const bottomMesh = new THREE.Mesh(bottomGeometry, frameMaterial);
    bottomMesh.position.set(0, -height / 2 + frameThickness / 2, 0);
    doorFrame.add(bottomMesh);

    const sideHeight = height - 2 * frameThickness;
    const leftGeometry = new THREE.BoxGeometry(frameThickness, sideHeight, frameThickness);
    const leftMesh = new THREE.Mesh(leftGeometry, frameMaterial);
    leftMesh.position.set(-width / 2 + frameThickness / 2, 0, 0);
    doorFrame.add(leftMesh);

    const rightGeometry = new THREE.BoxGeometry(frameThickness, sideHeight, frameThickness);
    const rightMesh = new THREE.Mesh(rightGeometry, frameMaterial);
    rightMesh.position.set(width / 2 - frameThickness / 2, 0, 0);
    doorFrame.add(rightMesh);

    doorGroup.add(doorFrame);

    const glassWidth = width - 2 * frameThickness;
    const glassHeight = height - 2 * frameThickness + 0.3;

    const blindGeometry = new THREE.BoxGeometry(glassWidth, 1, 0.1);
    const glassGeometry = new THREE.BoxGeometry(glassWidth, 1, 0.1);

    const blindMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        transparent: false
    });

    const glassMaterial = new THREE.MeshPhongMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.5
    });

    const blindPart = new THREE.Mesh(blindGeometry, blindMaterial);
    const glassPart = new THREE.Mesh(glassGeometry, glassMaterial);

    doorGroup.add(blindPart);
    doorGroup.add(glassPart);

    let currentPosition = 0;
    let targetPosition = 0;
    let animating = false;

    if (initialPosition !== null) {
        currentPosition = initialPosition;
        targetPosition = initialPosition;
        applyBlinds(initialPosition);
    }
    
    function applyBlinds(position) {
        const ratio = position / 100;
        const glassH = glassHeight * ratio;
        const blindH = glassHeight - glassH;
        const offset = 0;

        blindPart.scale.y = blindH;
        blindPart.position.y = (height / 2) - (blindH / 2) - offset;

        glassPart.scale.y = glassH;
        glassPart.position.y = (height / 2) - blindH - (glassH / 2) - offset;
    }

    function animateBlinds() {
        if (!animating) return;

        const diff = targetPosition - currentPosition;
        if (Math.abs(diff) < 0.5) {
            currentPosition = targetPosition;
            applyBlinds(currentPosition);
            animating = false;
            return;
        }
        // if its the window do it faster
        if (blindEntityId.includes('window')) {
            currentPosition += Math.sign(diff) * 0.098; // 17 secs
        } else {
            currentPosition += Math.sign(diff) * 0.0833; // 20 secs
        }
        applyBlinds(currentPosition);
        requestAnimationFrame(animateBlinds);
    }

    function updateBlinds(position, animate = true) {
        targetPosition = Math.max(0, Math.min(100, position));
        if (animate && targetPosition !== currentPosition) {
            animating = true;
            requestAnimationFrame(animateBlinds);
        } else {
            currentPosition = targetPosition;
            applyBlinds(currentPosition);
        }
    }
    

    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 16);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(right ? -width / 2 + frameThickness / 2 : width / 2 - frameThickness / 2, 0, 0.15);
    doorGroup.add(handle);

    doorGroup.position.set(x, height / 2 + (bottom ? 1.35 : 0), -z);
    doorGroup.rotation.y = THREE.MathUtils.degToRad(angle);

    doorGroup.userData.interactive = true;
    group.add(doorGroup);

    let glassPanel = doorGroup;

    glassPanel.userData.interactive = true;
    glassPanel.userData.onClick = () => {
        console.log("🪟 Toggle Blind:", blindEntityId);
        sendToHASocket({
            id: Math.floor(Math.random() * 1000),
            type: "call_service",
            domain: "cover",
            service: "toggle",
            target: { entity_id: blindEntityId }
        });
    };

    return { updateBlinds, glassPanel };
}