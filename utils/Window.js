import * as THREE from '/local/HomeSphere/three/build/three.module.js'

export function addGlassWindow(
    livingroomGroup,
    x,
    z,
    distanceFromFloor = 0.25,
    width = 4,
    height = 3,
    colorChoice = 'lightblue',  // This parameter will control the color
    rotation = { x: 0, y: 0, z: 0 }  // Rotation parameters in radians
) {
    const windowGroup = new THREE.Group();
    const frameThickness = 0.2;
    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0xfefefe }); // Gray metallic frame

    // Helper function to create a frame piece
    const createFramePiece = (w, h, posX, posY) => {
        const geometry = new THREE.BoxGeometry(w, h, frameThickness);
        const mesh = new THREE.Mesh(geometry, frameMaterial);
        mesh.position.set(posX, posY + distanceFromFloor / 4, 0);
        return mesh;
    };

    // Build the frame (common to both branches)
    const frameGroup = new THREE.Group();
    frameGroup.add(createFramePiece(width+0.2, frameThickness, 0, height / 2));  // Top
    frameGroup.add(createFramePiece(width+0.2, frameThickness, 0, -height / 2)); // Bottom
    frameGroup.add(createFramePiece(frameThickness, height, -width / 2, 0)); // Left
    frameGroup.add(createFramePiece(frameThickness, height, width / 2, 0));  // Right
    windowGroup.add(frameGroup);

    // Create the glass pane geometry (common)
    const glassGeometry = new THREE.BoxGeometry(width - frameThickness, height - frameThickness, 0.1);
    let glassMaterial;

    // Choose the color for the glass based on colorChoice parameter
    if (colorChoice === 'lightblue') {
        glassMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB, // Light blue tint
            transparent: false,  // No transparency
            opacity: 1           // Fully opaque
        });
    } else if (colorChoice === 'black') {
        glassMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000, // Black tint
            transparent: false,  // No transparency
            opacity: 1           // Fully opaque
        });
    }

    const glassPane = new THREE.Mesh(glassGeometry, glassMaterial);
    glassPane.position.set(0, distanceFromFloor / 4, 0.01);
    windowGroup.add(glassPane);
    const glassPane_outside = new THREE.Mesh(glassGeometry, glassMaterial);
    glassPane_outside.position.set(0, distanceFromFloor / 4, -0.01);
    windowGroup.add(glassPane_outside);

    // Apply rotation to the windowGroup
    windowGroup.rotation.set(rotation.x, rotation.y, rotation.z);

    // Position & add the window group to the room
    windowGroup.position.set(x, height / 2 + 1, -z);
    livingroomGroup.add(windowGroup);
}
