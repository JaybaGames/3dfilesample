// service-worker.js
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('my-cache').then(cache => {
      return cache.addAll([
        './',
		'./index.html',
		'./script.js',
		'./style.css',
		// THREEJS
		'./three.module.js',
  		'./examples/OrbitControls.js',
  		'./examples/GLTFLoader.js',
		// Dino model
		'./models/dino/scene.gltf',
		'./models/dino/scene.bin',
		'./models/dino/textures/material_baseColor.jpeg',
		'./models/dino/textures/Skull_baseColor.jpeg',
		// Eye model
		'./models/eye/scene.gltf',
		'./models/eye/scene.bin',
		'./models/eye/textures/CORNEA_normal.png',
		'./models/eye/textures/IRIS_FINAL_baseColor.jpeg',
		'./models/eye/textures/IRIS_FINAL_metallicRoughness.png',
		'./models/eye/textures/IRIS_FINAL_normal.jpeg'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
