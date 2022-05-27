
////////////////////////////////////////////////////////////////////////////////////////////
///                                                                                      ///
///  Developer Interactive UIUX  2021-2022                                               ///
///  Contact Shane Brumback https://www.shanebrumback.com                                ///
///  Message me for questions about any of my projects                                   ///
///                                                                                      ///
///                                                                                      ///
////////////////////////////////////////////////////////////////////////////////////////////

//Load the required resources from threejs
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
//import * as dat from 'dat.gui'

//set up the variables for the app
let scene, camera, renderer, controls, manager, sound, stats,
    analyser, composer, bloomPass, meshCube, cubeLight, gui, guiElement;

let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;


//create the parameters for post processing
const params = {
    exposure: 1,
    bloomStrength: .5,
    bloomThreshold: 1.5,
    bloomRadius: .15
};

init();


//handles starting the audio processing
function playNow() {

    document.getElementById('divPlayButton').style.display = 'none';

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create the PositionalAudio object (passing in the listener)
    sound = new THREE.PositionalAudio(listener);

    // load a sound and set it as the PositionalAudio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./assets/game-changer.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setRefDistance(100);
        sound.play();
    });

    //set up the analyser so we can get the audio frequency data
    analyser = new THREE.AudioAnalyser(sound, 128)

    //add the audio to the cube mesh
    meshCube.add(sound);


}

//initialize threejs
function init() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 4000);
    renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(604, -337, 316);
    camera.updateProjectionMatrix();
    controls.update();

    guiElement = document.getElementById("divGui");

    //Stats display (not using at the moment)
    //stats = new Stats();
    //guiElement.appendChild(stats.domElement);
    //stats.domElement.id = 'stats';

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    const renderScene = new RenderPass(scene, camera);

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    composer.renderToScreen = true;

    loadCube();

    cubeLight = new THREE.PointLight(0xFFFFFF);
    cubeLight.position.set(0, 0, 0);
    scene.add(cubeLight);

    const hemiLight = new THREE.AmbientLight(0x404040, 1); // soft white light
    hemiLight.position.set(0, 300, 0);
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(75, 300, 75);
    scene.add(dirLight);

    window.addEventListener('pointermove', onPointerMove);

    var playButton = document.getElementById('divPlayButton');
    playButton.addEventListener('pointerdown', playNow);

    window.addEventListener('resize', onWindowResize);


    //for gui display (not using at the moment)

    //gui = new GUI();

    //gui.add(params, 'exposure', 0.1, 2).onChange(function (value) {

    //    renderer.toneMappingExposure = Math.pow(value, 4.0);

    //});

    //gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {

    //    bloomPass.threshold = Number(value);

    //});

    //gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {

    //    bloomPass.strength = Number(value);

    //});

    //gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {

    //    bloomPass.radius = Number(value);

    //});

    // guiElement.appendChild(gui.domElement);
    // gui.domElement.id = 'gui';


    animate();

}

//handles pc and mobile pointer movement
function onPointerMove(event) {

    if (event.isPrimary === false) return;

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;



}

//handles sound frequency data
function getAverageFrequency() {

    try {

        let value = 0;
        const data = analyser.getFrequencyData();

        for (let i = 0; i < data.length; i++) {

            value += data[i];

        }

        return value / data.length;

    } catch (errro) {

    }

}

//handles window resize events
function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    composer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);

    try {


        if (window.innerWidth <= 800) {

            document.getElementById("divGui").style.display = 'none';

        } else {

            document.getElementById("divGui").style.display = 'block';
        }

    } catch (error) {

    }



}

//handles animating the canvas and 
//sound interactiive objects
function animate() {

    requestAnimationFrame(animate);
    controls.update();


    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (- mouseY - camera.position.y) * 0.05;


    const time = Date.now() * 0.001;

    if (sound) {

        let freq = Math.round(getAverageFrequency() / 2);
        bloomPass.threshold = freq / 100;
        renderer.toneMappingExposure = Math.pow(1 + (freq / 50), 4.0) * Math.sin(time * .10);
        bloomPass.strength = .5;
        bloomPass.radius = freq / 200;
        document.getElementById("divRange").style.width = ((freq * (500)) / 100) + 'px';
        document.getElementById("divRangeFooter").style.width = ((freq * (500)) / 100) + 'px';

    }

    meshCube.rotation.x = time * 0.25;
    meshCube.rotation.y = time * 0.5;

    camera.lookAt(meshCube.position);
    camera.updateProjectionMatrix();


    //stats.update();  (not using at the moment)

    composer.render();


};


//handles loading 1000000 polygons
function loadCube() {


    const triangles = 1000000;

    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const normals = [];
    const colors = [];

    const color = new THREE.Color();

    const n = 800, n2 = n / 2;  // triangles spread in the cube
    const d = 12, d2 = d / 2;   // individual triangle size

    const pA = new THREE.Vector3();
    const pB = new THREE.Vector3();
    const pC = new THREE.Vector3();

    const cb = new THREE.Vector3();
    const ab = new THREE.Vector3();

    for (let i = 0; i < triangles; i++) {

        // positions

        const x = Math.random() * n - n2;
        const y = Math.random() * n - n2;
        const z = Math.random() * n - n2;

        const ax = x + Math.random() * d - d2;
        const ay = y + Math.random() * d - d2;
        const az = z + Math.random() * d - d2;

        const bx = x + Math.random() * d - d2;
        const by = y + Math.random() * d - d2;
        const bz = z + Math.random() * d - d2;

        const cx = x + Math.random() * d - d2;
        const cy = y + Math.random() * d - d2;
        const cz = z + Math.random() * d - d2;

        positions.push(ax, ay, az);
        positions.push(bx, by, bz);
        positions.push(cx, cy, cz);

        // flat face normals

        pA.set(ax, ay, az);
        pB.set(bx, by, bz);
        pC.set(cx, cy, cz);

        cb.subVectors(pC, pB);
        ab.subVectors(pA, pB);
        cb.cross(ab);

        cb.normalize();

        const nx = cb.x;
        const ny = cb.y;
        const nz = cb.z;

        normals.push(nx, ny, nz);
        normals.push(nx, ny, nz);
        normals.push(nx, ny, nz);

        // colors

        const vx = (x / n) + 0.5;
        const vy = (y / n) + 0.5;
        const vz = (z / n) + 0.5;

        color.setRGB(vx, vy, vz);

        const alpha = Math.random();

        colors.push(color.r, color.g, color.b, alpha);
        colors.push(color.r, color.g, color.b, alpha);
        colors.push(color.r, color.g, color.b, alpha);

    }

    function disposeArray() {

        this.array = null;

    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3).onUpload(disposeArray));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3).onUpload(disposeArray));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4).onUpload(disposeArray));

    geometry.computeBoundingSphere();

    const material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
        side: THREE.DoubleSide, vertexColors: true, transparent: true
    });

    meshCube = new THREE.Mesh(geometry, material);
    meshCube.scale.set(.5, .5, .5);
    scene.add(meshCube);

    document.getElementById('divPlayButton').innerHTML = '<i class="fas fa-play"></i>';



}