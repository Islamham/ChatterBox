import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg')});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);


var clock
var mixer

// Load GLTF model with Draco compression support
let model;
let model2
async function loadModel() {

    clock = new THREE.Clock();

    const loader = new GLTFLoader();

    // Add DRACOLoader to GLTFLoader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.129.0/examples/js/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    try {
        const gltf2 = await loader.loadAsync('https://cpen320.s3.us-east-1.amazonaws.com/robot_playground.glb');
        model2 = gltf2.scene;
        scene.add(model2)
        model2.scale.set(20, 20, 20); // Scale the model down to half its original size
        gltf2.scene.position.set(0,-20,0);
        if (gltf2.animations.length > 0) {
            mixer = new THREE.AnimationMixer( gltf2.scene );
            gltf2.animations.forEach( clip => { mixer.clipAction( clip ).loop = THREE.LoopRepeat; } );
            mixer.clipAction( gltf2.animations[ 0 ] ).play();
        }

    } catch (error) {
        console.error('Error loading model:', error);
    }
}

loadModel();

// Animation loop
function animate() {
    if (model2) {
            // Slow zoom in and out
            const time = Date.now() * 0.001;
            model2.position.z = Math.sin(time) * 5;
            model2.rotation.y += 0.005;
    
            // Reset animation
            if (time % (2 * Math.PI) < 0.01) {
                model2.rotation.y = 0;
            }
    }
    requestAnimationFrame(animate);
    if ( mixer ) mixer.update( clock.getDelta() );
    renderer.render(scene, camera);
}

animate();
