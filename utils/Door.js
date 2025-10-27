import * as THREE from '/local/HomeSphere/three/build/three.module.js'

export function addDecorativeDoor(livingroomGroup, x, z, angle = 0, width = 2, height = 6) {
    // Create a group to hold the door and all decorations
    const doorGroup = new THREE.Group();

    // Door Base (main rectangle)
    const doorGeometry = new THREE.BoxGeometry(width, height, 0.15); // Thin door
    const doorMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff }); // White door
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    doorMesh.position.set(0, height / 2, 0);  // Center vertically
    doorGroup.add(doorMesh);

    // Door Panels (some decorative rectangles to make it look like a door with panels)
    const panelGeometry = new THREE.BoxGeometry(width * 0.8, height * 0.8, 0.05);
    const panelMaterial = new THREE.MeshPhongMaterial({ color: 0xdedede }); // Slightly darker panels

    function addPanel(offsetY, depth) {
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(0, offsetY, depth); // Place at specified depth (front or back)
        doorGroup.add(panel);
    }

    // Add panel on front and back
    addPanel(height * 0.5, 0.06);    // Front side
    addPanel(height * 0.5, -0.06);   // Back side

    // Door Handle (small cylinder)
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0xd4af37 }); // Gold color

    function addHandle(offsetX, offsetY, depth) {
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.z = Math.PI / 2; // Horizontal handle
        handle.position.set(offsetX, offsetY, depth);
        doorGroup.add(handle);
    }

    // Add handle on both sides
    addHandle(width * 0.4, height * 0.4, 0.1);    // Front side
    addHandle(width * 0.4, height * 0.4, -0.1);  // Back side (flipped for other side)

    // Set position and rotation of the whole door group
    doorGroup.position.set(x, 0, -z); // Place on the floor at the desired x and z

    // Apply rotation (convert degrees to radians)
    doorGroup.rotation.y = THREE.MathUtils.degToRad(angle);

    // Add to the livingroom group
    livingroomGroup.add(doorGroup);
}
