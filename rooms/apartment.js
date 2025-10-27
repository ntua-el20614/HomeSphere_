// rooms/apartment.js
import * as THREE from '/local/HomeSphere/three/build/three.module.js'

function parseColor(input) {
    const namedColors = {
        red: 0xff0000,
        green: 0x00ff00,
        blue: 0x0000ff,
        yellow: 0xffff00,
        cyan: 0x00ffff,
        magenta: 0xff00ff,
        white: 0xffffff,
        gray: 0x808080,
        black: 0x000000,
        brown: 0x964B00,
    };

    if (input.startsWith("#")) {
        return parseInt(input.replace("#", "0x"));
    } else if (namedColors[input.toLowerCase()]) {
        return namedColors[input.toLowerCase()];
    } else {
        console.warn(`Unknown color: ${input}, defaulting to gray.`);
        return namedColors.gray;
    }
}

/**
 * createApartment:
 *  - Builds a wooden floor (top surface only), walls, and points,
 *    interpreting the provided coordinates as x, y, z (y is vertical).
 */
export function createApartment(scene) {
    const devices = [];
    const apartmentGroup = new THREE.Group();
    scene.add(apartmentGroup);

    // -------------------------------------------
    // Load Wood Texture
    // -------------------------------------------
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('models/floor/wood.jpg');
    // Tile the texture more (20×20) so planks look smaller
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(0.1, 0.1);

    // -------------------------------------------
    // Lighting
    // -------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // -------------------------------------------
    // Define Floor Shape (2D)
    // -------------------------------------------
    const floorShape = new THREE.Shape();
    floorShape.moveTo(0, 3);
    floorShape.lineTo(13, 3);
    floorShape.lineTo(13, 0);
    floorShape.lineTo(25, 0);
    floorShape.lineTo(25, 3);
    floorShape.lineTo(29.15, 3);
    floorShape.lineTo(43, 38);
    floorShape.lineTo(42, 38);
    floorShape.lineTo(42, 39);
    floorShape.lineTo(41, 39);
    floorShape.lineTo(41, 42);
    floorShape.lineTo(26, 42);
    floorShape.lineTo(26, 31);
    floorShape.lineTo(10, 31);
    floorShape.lineTo(10, 13);
    floorShape.lineTo(0, 13);
    floorShape.closePath();

    // -------------------------------------------
    // Create the top surface (ShapeGeometry)
    // -------------------------------------------
    const floorTopGeometry = new THREE.ShapeGeometry(floorShape);
    const floorTopMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.8,
        metalness: 0.0,
        side: THREE.DoubleSide
    });

    const floorTopMesh = new THREE.Mesh(floorTopGeometry, floorTopMaterial);
    // By default, ShapeGeometry is oriented in the XY plane; rotate -90° around X to make it XZ
    floorTopMesh.rotation.x = -Math.PI / 2;
    floorTopMesh.position.y = 0;
    floorTopMesh.receiveShadow = true;
    apartmentGroup.add(floorTopMesh);

    // -------------------------------------------
    // Create Walls
    // -------------------------------------------
    const wallsData = [
        // Kitchen walls (warm wheat color)
        { start: [0, 0, -3], end: [13, 0, -3], height: 6, thick: 0.1, color:"#F5DEB3" },
        { start: [13, 0, 0], end: [13, 0, 3], height: 6, thick: 0.1, color:"#F5DEB3" },
        { start: [13, 0, 0], end: [25, 0, 0], height: 6, thick: 0.1, color:"#F5DEB3" },
        { start: [25, 0, 0], end: [25, 0, 9], height: 6, thick: 0.1, color:"#F5DEB3" },
        { start: [0, 0, -3], end: [0, 0, 7], height: 6, thick: 0.1, color:"#F5DEB3" },
        { start: [0, 0, -13], end: [20, 0, -13], height: 6, thick: 0.1, color:"#F5DEB3" },

        // Office walls (light)
        { start: [10, 0, -13], end: [10, 0, 2], height: 6, thick: 0.1, color:"#dedede" },
        { start: [23, 0, -28], end: [23, 0, -38], height: 6, thick: 0.1, color:"#dedede" },
        { start: [23, 0, -18], end: [20, 0, -23], height: 6, thick: 0.1, color:"#dedede" },

        // Fence - balcony
        { start: [10, 0, -28], end: [10, 0, -25], height: 6, thick: 0.1, color:"brown" },
        { start: [10, 0, -31], end: [26, 0, -31], height: 3.75, thick: 0.1, color:"brown" },
        { start: [26, 0, -31], end: [26, 0, -20], height: 3.75, thick: 0.1, color:"brown" },
        { start: [26, 0, -42], end: [41, 0, -42], height: 3.75, thick: 0.1, color:"brown" },
        { start: [41, 0, -42], end: [41, 0, -45], height: 6, thick: 0.1, color:"brown" },

        // Bedroom walls
        { start: [40, 0, -39], end: [42, 0, -39], height: 6, thick: 0.1, color:"#dedede" },
        { start: [40, 0, -39], end: [40, 0, -40], height: 6, thick: 0.1, color:"#dedede" },
        { start: [42, 0, -39], end: [42, 0, -40], height: 6, thick: 0.1, color:"#dedede" },
        { start: [29, 0, -26], end: [37, 0, -29.15], height: 6, thick: 0.1, color:"#dedede" },
        { start: [42, 0, -38], end: [43, 0, -38], height: 6, thick: 0.1, color:"#dedede" },
        { start: [43, 0, -38], end: [29.15, 0, -73], height: 6, thick: 0.1, color:"#dedede" },

        // Bathroom walls
        { start: [25, 0, -3], end: [29.15, 0, -3], height: 6, thick: 0.1, color:"#dedede" },
        { start: [25, 0, -9], end: [28, 0, -4], height: 6, thick: 0.1, color:"#dedede" },
        { start: [28, 0, -14], end: [32.85, 0, -15.5], height: 6, thick: 0.1, color:"#dedede" },
        { start: [25, 0, -7], end: [27, 0, -7], height: 5, thick: 0.1, color:"#dedede" },
        { start: [25, 0, -9], end: [27.2, 0, -10.5], height: 5, thick: 0.1, color:"#dedede" },
        { start: [27.2, 0, -7.45], end: [27, 0, -7.95], height: 5, thick: 0.1, color:"#dedede" },

        // Kitchen counter walls
        { start: [23, 0, -9], end: [25, 0, -9], height: 3.6, thick: 0.1, color:"#ffffff" },
        { start: [23, 0, -5], end: [25, 0, -5], height: 3.6, thick: 0.1, color:"#ffffff" },
    ];

    wallsData.forEach(({ start, end, height, thick, color }) => {
        const wallColor = parseColor(color);
        const wallMaterial = new THREE.MeshPhongMaterial({ color: wallColor });
        const wallGroup = createWallSegment(start, end, height, thick, wallMaterial);
        apartmentGroup.add(wallGroup);
    });

    // -------------------------------------------
    // Ceiling (unchanged)
    // -------------------------------------------
    const ceilingShape = new THREE.Shape();
    ceilingShape.moveTo(25, 7);
    ceilingShape.lineTo(25, 9);
    ceilingShape.lineTo(27.2, 7.45);
    ceilingShape.lineTo(30.5, 6.4);
    ceilingShape.lineTo(30.3, 5.9);
    ceilingShape.lineTo(27, 7);
    const ceilingExtrudeSettings = {
        steps: 1,
        depth: 0.1,
        bevelEnabled: false
    };
    const ceilingGeometry = new THREE.ExtrudeGeometry(ceilingShape, ceilingExtrudeSettings);
    const ceilingMaterial = new THREE.MeshPhongMaterial({ color: parseColor("#ffffff") });
    const ceilingMesh = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceilingMesh.rotation.x = -Math.PI / 2;
    ceilingMesh.position.set(0, 5, 0);
    apartmentGroup.add(ceilingMesh);

    // -------------------------------------------
    // Points
    // -------------------------------------------
    const pointsData = [
        { position: [0, 0, 1], color: "red" },
        { position: [0, 1, 0], color: "blue" },
        { position: [1, 0, 0], color: "green" },
        // { position: [40, 0, -38], color: "green" }
    ];
    pointsData.forEach(({ position, color }) => {
        const pointColor = parseColor(color);
        const pointMaterial = new THREE.MeshPhongMaterial({ color: pointColor });
        const pointMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2), pointMaterial);
        pointMesh.position.set(...position);
        apartmentGroup.add(pointMesh);
    });

    // -------------------------------------------
    // Walls with holes
    // -------------------------------------------
    const wallWithOpeningInOffice = createWallSegment(
        [10, 0, -28],
        [23, 0, -28],
        6,
        0.1,
        new THREE.MeshPhongMaterial({ color: 0xffffff }),
        { cutoutX: 3.5, cutoutWidth: 5, cutoutHeight: 4.5, cutoutBottom: 0 }
    );
    apartmentGroup.add(wallWithOpeningInOffice);

    const wallWithOpeningWindowBedroom = createWallSegment(
        [40, 0, -38],
        [29, 0, -38],
        6,
        0.1,
        new THREE.MeshPhongMaterial({ color: 0xffffff }),
        { cutoutX: 4.5, cutoutWidth: 4, cutoutHeight: 2.75, cutoutBottom: 1.5 }
    );
    apartmentGroup.add(wallWithOpeningWindowBedroom);

    const wallWithOpeningLivingRoom = createWallSegment(
        [29, 0, -26],
        [23, 0, -26],
        6,
        0.1,
        new THREE.MeshPhongMaterial({ color: 0xffffff }),
        { cutoutX: 0.5, cutoutWidth: 5, cutoutHeight: 4.5, cutoutBottom: 0 }
    );
    apartmentGroup.add(wallWithOpeningLivingRoom);

    const wallWithOpeningBedroomBlind = createWallSegment(
        [29, 0, -38],
        [29, 0, -50],
        6,
        0.1,
        new THREE.MeshPhongMaterial({ color: 0xffffff }),
        { cutoutX: 4.75, cutoutWidth: 5, cutoutHeight: 4.5, cutoutBottom: 0 }
    );
    apartmentGroup.add(wallWithOpeningBedroomBlind);

    return { devices };
}

/**
 * createWallSegment:
 * Builds a wall as a box between start and end,
 * optionally with a rectangular cutout.
 */
function createWallSegment(start, end, height, thickness, material, cutout = null) {
    const group = new THREE.Group();
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const dx = endVec.x - startVec.x;
    const dz = endVec.z - startVec.z;
    const wallLength = Math.sqrt(dx*dx + dz*dz);

    if (!cutout) {
        // A full wall with no cutout
        const geometry = new THREE.BoxGeometry(wallLength, height, thickness);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(wallLength / 2, height / 2, 0);
        group.add(mesh);
    } else {
        // A wall with a rectangular cutout
        const { cutoutX, cutoutWidth, cutoutHeight, cutoutBottom } = cutout;
        if (cutoutX + cutoutWidth > wallLength) {
            console.warn("Cutout exceeds wall length! Adjusting...");
            return null;
        }
        const leftWallWidth = cutoutX;
        const rightWallWidth = wallLength - (cutoutX + cutoutWidth);
        const upperWallHeight = height - (cutoutBottom + cutoutHeight);
        const lowerWallHeight = cutoutBottom;

        // Left
        if (leftWallWidth > 0) {
            const leftGeom = new THREE.BoxGeometry(leftWallWidth, height, thickness);
            const leftMesh = new THREE.Mesh(leftGeom, material);
            leftMesh.castShadow = true;
            leftMesh.receiveShadow = true;
            leftMesh.position.set(leftWallWidth/2, height/2, 0);
            group.add(leftMesh);
        }
        // Right
        if (rightWallWidth > 0) {
            const rightGeom = new THREE.BoxGeometry(rightWallWidth, height, thickness);
            const rightMesh = new THREE.Mesh(rightGeom, material);
            rightMesh.castShadow = true;
            rightMesh.receiveShadow = true;
            rightMesh.position.set(leftWallWidth + cutoutWidth + rightWallWidth/2, height/2, 0);
            group.add(rightMesh);
        }
        // Top
        if (upperWallHeight > 0) {
            const topGeom = new THREE.BoxGeometry(cutoutWidth, upperWallHeight, thickness);
            const topMesh = new THREE.Mesh(topGeom, material);
            topMesh.castShadow = true;
            topMesh.receiveShadow = true;
            topMesh.position.set(leftWallWidth + cutoutWidth/2, cutoutBottom + cutoutHeight + upperWallHeight/2, 0);
            group.add(topMesh);
        }
        // Bottom
        if (lowerWallHeight > 0) {
            const bottomGeom = new THREE.BoxGeometry(cutoutWidth, lowerWallHeight, thickness);
            const bottomMesh = new THREE.Mesh(bottomGeom, material);
            bottomMesh.castShadow = true;
            bottomMesh.receiveShadow = true;
            bottomMesh.position.set(leftWallWidth + cutoutWidth/2, lowerWallHeight/2, 0);
            group.add(bottomMesh);
        }
    }

    // Position and rotate the entire wall group
    group.position.copy(startVec);
    const angle = Math.atan2(dz, dx);
    group.rotation.y = angle;

    return group;
}
