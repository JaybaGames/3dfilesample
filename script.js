let installPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // prevent browser mini-banner
  installPrompt = e;

  // Show your install screen or button
  document.getElementById('installScreen').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (!installPrompt) return;

  installPrompt.prompt(); // opens browser install dialog
  const result = await installPrompt.userChoice;

  if (result.outcome === 'accepted') {
    console.log('User installed the app');
  } else {
    console.log('User dismissed install');
  }

  installPrompt = null;
});






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
let objToRender = 'dino';

let buttones = document.querySelector("#buttones");
buttones.onclick = function(){
	if(objToRender == 'dino')
		objToRender = 'eye';
	else
		objToRender = 'dino';
	
	scene.remove(object)
	
	loader.load(
		`./models/${objToRender}/scene.gltf`,
		function (gltf) {
			//If the file is loaded, add it to the scene
			object = gltf.scene;
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

	camera.position.z = objToRender === "dino" ? 25 : 300;
	
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
}

//Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

//Load the file
loader.load(
  `./models/${objToRender}/scene.gltf`,
  function (gltf) {
    //If the file is loaded, add it to the scene
    object = gltf.scene;
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

//Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

//Set how far the camera will be from the 3D model
camera.position.z = objToRender === "dino" ? 25 : 300;

//Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "dino" ? 5 : 1);
scene.add(ambientLight);
scene.background = new THREE.Color(0xccbbcc);

//This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "dino") {
  controls = new OrbitControls(camera, renderer.domElement);
}

const clock = new THREE.Clock();
//Render the scene
function animate() {
  requestAnimationFrame(animate);
  //Here we could add some code to update the scene, adding some automatic movement

	const t = clock.getElapsedTime();

	if(object){
		if(object.scale){
	object.scale.y = 1 + Math.sin(t * 2) * 0.1;
  object.scale.x = 1 - Math.sin(t * 2) * 0.05;
  object.scale.z = 1 - Math.sin(t * 2) * 0.05;
		}
	}

  //Make the eye move
  if (object && objToRender === "eye") {
    //I've played with the constants here until it looked good 
    object.rotation.y = -3 + mouseX / window.innerWidth * 3;
    object.rotation.x = -1.2 + mouseY * 2.5 / window.innerHeight;
  }
  renderer.render(scene, camera);
  
  
}

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

//Start the 3D rendering
animate();

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
