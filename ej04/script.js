import * as THREE from './three.module.js';
import { OrbitControls } from './orbitcontrols.js';

// Crear la escena, la cámara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear controles de órbita para la cámara
const controls = new OrbitControls(camera, renderer.domElement);

// Crear ejes con líneas más gruesas
const axesHelper = new THREE.AxesHelper(15);
scene.add(axesHelper);

// Crear una base gris (plano) bajo las barras
const planeGeometry = new THREE.PlaneGeometry(15, 15); // Dimensiones del plano
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide }); // Color blanco
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotar el plano para que sea horizontal
plane.position.y = 0; // Ajustar la altura del plano
plane.position.x = 7.5; // Centrar en el eje X
plane.position.z = 7.5; // Centrar en el eje Z
scene.add(plane); // Añadir el plano a la escena

// Función para crear la cuadrícula
function createGrid(size, divisions) {
  const gridMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Color negro
  const halfSize = size / 2;

  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  // Crear líneas en el eje X
  for (let i = -halfSize; i <= halfSize; i += size / divisions) {
    vertices.push(-halfSize, 0, i); // Línea horizontal
    vertices.push(halfSize, 0, i);
    vertices.push(i, 0, -halfSize); // Línea vertical
    vertices.push(i, 0, halfSize);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  const grid = new THREE.LineSegments(geometry, gridMaterial);
  scene.add(grid);
}

// Crear la cuadrícula
createGrid(30, 30); // Tamaño y número de divisiones

// Datos de las barras en el eje X y eje Z
const barDataX = [5, 7, 3, 9, 6, 4, 10, 5, 7, 9, 6, 8, 3, 2, 7]; // Alturas de las barras en el eje X
const barDataZ = [4, 8, 3, 6, 7, 5, 9, 6, 4, 8, 5, 7, 2, 3, 6]; // Alturas de las barras en el eje Z
const barWidth = 0.5;
const bars = [];
const labels = [];

// Colores originales para las caras
const faceColors = [
  0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff
]; // Colores diferentes para las 6 caras

// Función para crear barras
function createBars(barData) {
  barData.forEach((height, i) => {
    const geometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
    const materials = faceColors.map(color => new THREE.MeshBasicMaterial({ color }));
    const bar = new THREE.Mesh(geometry, materials);
    bar.position.set(0.2 + i + barWidth / 2, height, barWidth / 2); // Posición ajustada para eje X o Z
    scene.add(bar);
    bars.push(bar);

    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.color = 'white';
    label.innerHTML = height.toString();
    document.body.appendChild(label);
    labels.push({ element: label, bar: bar, height });
  });
}

function createBars2(barData) {
  barData.forEach((height, i) => {
    const geometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
    const materials = faceColors.map(color => new THREE.MeshBasicMaterial({ color }));
    const bar = new THREE.Mesh(geometry, materials);
    bar.position.set(barWidth / 2, height, 0.2 + i + barWidth / 2); // Posición ajustada para eje X o Z
    scene.add(bar);
    bars.push(bar);

    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.color = 'white';
    label.innerHTML = height.toString();
    document.body.appendChild(label);
    labels.push({ element: label, bar: bar, height });
  });
}

// Crear barras en el eje X
createBars(barDataX);

// Crear barras en el eje Z
createBars2(barDataZ);

// Posicionar la cámara
camera.position.z = 20;
camera.position.y = 10;

// Función para actualizar las posiciones de las etiquetas en cada cuadro
function updateLabels() {
  labels.forEach(({ element, bar }) => {
    const vector = new THREE.Vector3(bar.position.x, bar.position.y + bar.scale.y / 2 + 0.2, bar.position.z);
    vector.project(camera);
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
}

// Función para cambiar colores aleatoriamente
function changeBarsColor() {
  bars.forEach(bar => {
    bar.material.forEach(material => {
      material.color.setHex(Math.random() * 0xffffff);
    });
  });
}

// Detectar clics fuera de las barras
window.addEventListener('click', (event) => {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  
  const intersects = raycaster.intersectObjects(bars);

  if (intersects.length === 0) {
    // Si no hay intersección con las barras, cambiar colores
    changeBarsColor();
  }
});

// Función de animación para que las barras crezcan y se achiquen
let time = 0;
const animate = () => {
  requestAnimationFrame(animate);
  time += 0.05;
  bars.forEach((bar, index) => {
    const originalHeight = index < barDataX.length ? barDataX[index] : barDataZ[index - barDataX.length];
    const scaleY = (Math.sin(time + index) + 1) / 2 + 0.5;
    bar.scale.y = scaleY * originalHeight;
    bar.position.y = bar.scale.y / 2;
    labels[index].element.innerHTML = Math.round(bar.scale.y).toString();
  });
  
  controls.update();
  updateLabels();
  renderer.render(scene, camera);
};

// Iniciar la animación
animate();

// Ajustar el tamaño del renderizador si la ventana cambia de tamaño
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
