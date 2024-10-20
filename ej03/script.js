import * as THREE from './three.module.js';
import { OrbitControls } from './orbitcontrols.js';

// Datos de ejemplo con más barras
const data = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

let scene, camera, renderer, controls;
const bars = []; // Array para almacenar las barras
const barWidth = 1;
const barSpacing = 0.5;

function init() {
    // Crear la escena
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    // Crear barras
    createBars();
    createBase(); // Crear la base del gráfico
    createSun();  // Crear el sol
    createluna()
    createEarth()
    createMars()
    createStars(); // Crear estrellas

    camera.position.z = 15;

    animate();
}

function createBars() {
    data.forEach((value, index) => {
        const geometry = new THREE.BoxGeometry(barWidth, value, barWidth);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const bar = new THREE.Mesh(geometry, material);

        // Posicionar la barra
        bar.position.x = index * (barWidth + barSpacing) - (data.length * (barWidth + barSpacing)) / 2 + barWidth / 2;
        bar.position.y = value / 2; // Posicionar en el eje Y a la mitad de su altura
        bar.position.z = 0; // Mantener en el plano Z
        scene.add(bar);

        // Almacenar la barra en el array
        bars.push(bar);

        // Añadir evento de clic
        bar.userData = { value: value }; // Almacenar valor para referencia
        bar.onClick = function() {
            this.material.color.set(Math.random() * 0xffffff); // Cambiar a un color aleatorio
        };
    });
}

// Crear base del gráfico
function createBase() {
    const baseGeometry = new THREE.BoxGeometry((barWidth + barSpacing) * data.length - barSpacing, 0.2, 1);
    const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.x = -0.235
    base.position.y = -0.1; // Posicionar la base justo debajo de las barras
    base.position.z = 0; // Mantener en el plano Z
    scene.add(base);
}

// Crear el sol
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Color amarillo
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 5, -15); // Posicionar detrás de las barras
    scene.add(sun);
}

function createluna() {
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xA9A9A9 }); // Color amarillo
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 5, 20); // Posicionar detrás de las barras
    scene.add(sun);
}

function createEarth() {
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x1E90FF }); // Color azul para la Tierra
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(5, 0, -10); // Posicionar la Tierra
    scene.add(earth);
}

function createMars() {
    const marsGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const marsMaterial = new THREE.MeshBasicMaterial({ color: 0xB22222 }); // Color rojo para Marte
    const mars = new THREE.Mesh(marsGeometry, marsMaterial);
    mars.position.set(-5, 0, 10); // Posicionar Marte
    scene.add(mars);
}

// Crear estrellas
function createStars() {
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < 200; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        // Posicionar aleatoriamente las estrellas
        star.position.x = Math.random() * 100 - 50;
        star.position.y = Math.random() * 100 - 50;
        star.position.z = Math.random() * 100 - 50;
        scene.add(star);
    }
}

// Cambiar tamaño de barras al azar
function randomizeBarSizes() {
    bars.forEach(bar => {
        const newHeight = Math.random() * 10; // Nueva altura aleatoria
        bar.scale.y = newHeight; // Cambiar la escala en Y
        bar.position.y = newHeight / 2; // Ajustar la posición Y para que la parte superior quede sobre la base
    });
}

// Animar la escena
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Manejar clics en la escena
function onDocumentMouseDown(event) {
    event.preventDefault();

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        intersects[0].object.onClick.call(intersects[0].object); // Llamar a la función de clic
    } else {
        // Si se hace clic fuera de las barras, cambiar sus tamaños
        randomizeBarSizes();
    }
}

document.addEventListener('mousedown', onDocumentMouseDown, false);
init();
