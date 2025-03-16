// src/main.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'; // Import GLTFLoader
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'; // Import RGBELoader

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFF0F4); // background color
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 100);
pointLight.position.set(4, 3, -10);
scene.add(pointLight);

// Position the camera
camera.position.z = 5;

// Load GLB model using GLTFLoader
const gltfLoader = new GLTFLoader();
let model;

gltfLoader.load(
  './room.glb', // Replace with the path to your GLB file
  (gltf) => {
    model = gltf.scene; // Get the scene from the loaded GLTF
    scene.add(model); // Add the model to the scene
  },
  undefined, // Progress callback (optional)
  (error) => {
    console.error('An error occurred while loading the GLB model:', error);
  }
);

// Create a texture with 2D text
function createTextTexture(text, fontSize = 128, textColor = 'black', bgColor = 'white') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Set high-resolution canvas dimensions
  const resolutionMultiplier = window.devicePixelRatio || 1; // Adjust for high-DPI screens
  canvas.width = 2048 * resolutionMultiplier; // High resolution
  canvas.height = 1024 * resolutionMultiplier;

  // Scale the drawing to match the high resolution
  context.scale(resolutionMultiplier, resolutionMultiplier);

  // Draw background
  context.fillStyle = bgColor;
  context.fillRect(0, 0, canvas.width / resolutionMultiplier, canvas.height / resolutionMultiplier);

  // Draw text with anti-aliasing
  context.font = `${fontSize}px Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = textColor;
  context.fillText(
    text,
    canvas.width / (2 * resolutionMultiplier),
    canvas.height / (2 * resolutionMultiplier)
  );

  // Convert canvas to texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Improve texture sharpness
  return texture;
}

// Create a clickable box with text texture
const boxGeometry = new THREE.BoxGeometry(1.5, 0.5, 0.1); // Dimensions of the box
const textTexture = createTextTexture('About Me!', 300, 'black', 'white'); // Create texture with text

// Assign textures to each face of the box
const materials = [
  new THREE.MeshStandardMaterial({ color: 0xffffff }), // Right face
  new THREE.MeshStandardMaterial({ color: 0xffffff }), // Left face
  new THREE.MeshStandardMaterial({ color: 0xffffff }), // Top face
  new THREE.MeshStandardMaterial({ color: 0xffffff }), // Bottom face
  new THREE.MeshStandardMaterial({ map: textTexture }), // Front face (with text)
  new THREE.MeshStandardMaterial({ color: 0xffffff }), // Back face
];

const clickableBox = new THREE.Mesh(boxGeometry, materials);
clickableBox.position.set(2, 2.2, -2.98); // Position the box in the scene
scene.add(clickableBox);

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Handle mouse clicks
window.addEventListener('click', (event) => {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the current mouse position and camera
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with objects in the scene
  const intersects = raycaster.intersectObject(clickableBox); // Check only the box

  // Check if the box was clicked
  if (intersects.length > 0) {
    console.log('Box clicked!');

    // Show the "About Me" container
    const aboutMeContainer = document.getElementById('about-me-container');
    aboutMeContainer.style.display = 'block'; // Make the "About Me" section visible
  }
});

// Add close button functionality
document.getElementById('close-button').addEventListener('click', () => {
  const aboutMeContainer = document.getElementById('about-me-container');
  aboutMeContainer.style.display = 'none'; // Hide the "About Me" section
});

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI / 3; // Restrict vertical rotation
controls.maxPolarAngle = Math.PI / 3; // Restrict vertical rotation
controls.enableZoom = true; // Enable zooming
controls.minDistance = 2; // Minimum zoom distance
controls.maxDistance = 7; // Maximum zoom distance
camera.position.set(3, 0, 10);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update OrbitControls
  controls.update();

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});