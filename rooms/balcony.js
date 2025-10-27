// rooms/bathroom.js
import * as THREE from '/local/HomeSphere/three/build/three.module.js'
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
// import { metalness, roughness } from 'three/tsl';

export function createBalcony(scene) {
    const devices = [];
    
    const balconyGroup = new THREE.Group();
    scene.add(balconyGroup);

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
    const balconyShape = new THREE.Shape();

    balconyShape.moveTo(39, 41);
    balconyShape.lineTo(42, 41);


    balconyShape.lineTo(42, 26);
    balconyShape.lineTo(31, 26);
    balconyShape.lineTo(31, 10);
    balconyShape.lineTo(28, 10);
    balconyShape.lineTo(28, 23);
    balconyShape.lineTo(26, 23);
    balconyShape.lineTo(26, 29);
    balconyShape.lineTo(38, 29);
    balconyShape.lineTo(38, 40);
    balconyShape.lineTo(39, 40);
    balconyShape.lineTo(39, 41);
    


    //balconyShape.lineTo(0, 0);
    
    balconyShape.closePath();

    // Extrusion: we use a LineCurve3 to define a small vertical extrusion
    // that lifts the top of the floor to y = 0.01.
    const extrudePath = new THREE.LineCurve3(
        new THREE.Vector3(0, 0.02, 0), // starting at top (y = 0.01)
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

    const bathroomFloorGeometry = new THREE.ExtrudeGeometry(balconyShape, extrudeSettings);
    const bathroomFloorMaterial = new THREE.MeshPhongMaterial({
        map: ceramicTexture,
        // color: 0x808080,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    const balconyFloorMesh = new THREE.Mesh(bathroomFloorGeometry, bathroomFloorMaterial);
    balconyGroup.add(balconyFloorMesh);


    /*
    const loader = new GLTFLoader();

    
    loader.load('/local/HomeSphere/models/toilet.glb', (gltf) => {
        const toilet = gltf.scene;
        const degrees = 160;
        toilet.rotation.y = THREE.MathUtils.degToRad(degrees);
        toilet.position.set(30.75, 1, -9.75);
        toilet.scale.set(1, 1, 1);

        balconyGroup.add(toilet);
    });
    */


    
    
    return { devices };
    }
    