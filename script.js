/*
if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
    console.log("App is installed (standalone mode)!");
} else {
    console.log("App is running in browser, not installed.");
}
*/

//Import the THREE.js library
import * as THREE from "./three.module.js";
// https://raw.githubusercontent.com/mrdoob/three.js/r129/build/three.module.js

// To allow for the camera to move around the scene
import { OrbitControls } from "./examples/OrbitControls.js";
// https://raw.githubusercontent.com/mrdoob/three.js/r129/examples/jsm/controls/OrbitControls.js

// To allow for importing the .gltf file
import { GLTFLoader } from "./examples/GLTFLoader.js";
// https://raw.githubusercontent.com/mrdoob/three.js/r129/examples/jsm/loaders/GLTFLoader.js

//Create a Three.JS Scene
const scene = new THREE.Scene();
//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//Keep track of the mouse position, so we can make the eye move
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

//Keep the 3D object on a global variable so we can access it later
let object;

//OrbitControls allow the camera to move around the scene
let controls;

//Set which object to render
let objToRender = 'sprout_small';
	
/*
if (!document.fullscreenElement) {
	document.documentElement.requestFullscreen();
} else {
	document.exitFullscreen();
}
*/

//Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

//Load the file
loader.load(
  `./models/${objToRender}/scene.gltf`,
  function (gltf) {
    //If the file is loaded, add it to the scene
    object = gltf.scene;
	
	object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true; // optional
	  
	  /*
		var mesh = child;
		const pos = mesh.geometry.attributes.position;

		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const y = pos.getY(i);
			const z = pos.getZ(i);

			// Example deformation
			//pos.setY(i, y + Math.sin(x * 2) * 0.1);
			pos.setY(i, y*1.5);
		}

		pos.needsUpdate = true;
		mesh.geometry.computeVertexNormals();
		*/
    }
  });
	
    scene.add(object);
  },
  function (xhr) {
    //While it is loading, log the progress
    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    //If there is an error, log it
    console.error(error);
  }
);

//Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); //Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // soft & realistic

//Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

//Set how far the camera will be from the 3D model
camera.position.z = objToRender === "dino" ? 25 : 300;

//Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);


//This adds controls to the camera, so we can rotate / zoom it with the mouse

  controls = new OrbitControls(camera, renderer.domElement);


const clock = new THREE.Clock();
//Render the scene


//Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//add mouse position listener, so we can make the eye move
document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}



// Example "world data" structure
let worldData = {
  objToRender: objToRender, // current object
  objectScale: object ? { x: object.scale.x, y: object.scale.y, z: object.scale.z } : null,
  objectRotation: object ? { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z } : null,
};

// Helper: update worldData periodically
function updateWorldData() {
  worldData = {
    objToRender: objToRender,
    objectScale: object ? { x: object.scale.x, y: object.scale.y, z: object.scale.z } : null,
    objectRotation: object ? { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z } : null,
  };
}

// -------------------- FILE SYSTEM ACCESS API --------------------
const saveBtn = document.getElementById('saveWorldBtn');
const loadBtn = document.getElementById('loadWorldBtn');

// Save world to user-selected folder
saveBtn.addEventListener('click', async () => {
  updateWorldData(); // ensure latest data
  try {
    // Ask user to pick a folder
    const dirHandle = await window.showDirectoryPicker();
    const fileHandle = await dirHandle.getFileHandle('world.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(worldData, null, 2));
    await writable.close();
    alert('World saved successfully!');
  } catch (err) {
    console.error(err);
    alert('Failed to save world.');
  }
});

// Load world from user-selected folder
loadBtn.addEventListener('click', async () => {
  try {
    const dirHandle = await window.showDirectoryPicker();
    const fileHandle = await dirHandle.getFileHandle('world.json');
    const file = await fileHandle.getFile();
    const text = await file.text();
    const loadedData = JSON.parse(text);

    // Apply loaded data
    objToRender = loadedData.objToRender || 'dino';
    loader.load(`./models/${objToRender}/scene.gltf`, function (gltf) {
      if (object) scene.remove(object);
      object = gltf.scene;

      // Apply saved scale & rotation if available
      if (loadedData.objectScale) {
        object.scale.set(
          loadedData.objectScale.x,
          loadedData.objectScale.y,
          loadedData.objectScale.z
        );
      }
      if (loadedData.objectRotation) {
        object.rotation.set(
          loadedData.objectRotation.x,
          loadedData.objectRotation.y,
          loadedData.objectRotation.z
        );
      }
	  

      scene.add(object);
    });
    alert('World loaded successfully!');
  } catch (err) {
    console.error(err);
    alert('Failed to load world.');
  }
});

import { Sky } from './examples/Sky.js';

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const planeG = new THREE.PlaneGeometry(100, 100);
const planeM = new THREE.MeshStandardMaterial({color: "#430"});
planeM.side = THREE.DoubleSide;
const plane = new THREE.Mesh(planeG, planeM);
plane.rotation.x = Math.PI/2;
plane.position.y = 0;
plane.receiveShadow = true;
scene.add(plane);

const sun = new THREE.Vector3();

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 0.7;
skyUniforms['rayleigh'].value = 0.5;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

let time = 0; // 0 → 1 (day cycle)

function updateSun() {
  time += 0.00003; // speed
  if (time > 1) time = 0;

  const phi = THREE.MathUtils.degToRad(90 - time * 180);
  const theta = THREE.MathUtils.degToRad(180);

  sun.setFromSphericalCoords(1, phi, theta);
  sky.material.uniforms['sunPosition'].value.copy(sun);


}

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 8, -30);
sunLight.castShadow = true;
scene.add(sunLight);
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;

sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;

sunLight.shadow.bias = -0.0005; // fixes acne

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

sunLight.intensity = 1;

function animate() {
  requestAnimationFrame(animate);
  //Here we could add some code to update the scene, adding some automatic movement

	const t = clock.getElapsedTime();

	//if(object){
	//	if(object.scale){
	//object.scale.y = 1 + Math.sin(t * 2) * 0.1;
 // object.scale.x = 1 - Math.sin(t * 2) * 0.05;
 // object.scale.z = 1 - Math.sin(t * 2) * 0.05;
	//	}
	//}

  //Make the eye move
  if (object && objToRender === "eye") {
    //I've played with the constants here until it looked good 
    object.rotation.y = -3 + mouseX / window.innerWidth * 3;
    object.rotation.x = -1.2 + mouseY * 2.5 / window.innerHeight;
  }
  renderer.render(scene, camera);

  updateSun()
}
updateSun()
animate()
