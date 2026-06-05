/**
 * visor3d.js - Visor 3D de plantas usando Three.js
 */

let scene, camera, renderer;
let plantaMesh;
let autoRotate = false;
let planta3dActual = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarPlanta3D();
});

async function cargarPlanta3D() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (id) {
    try {
      const plantas = await cargarTodasLasPlantas();
      planta3dActual = plantas.find(p => p.id === id);
      
      if (planta3dActual) {
        document.getElementById('planta3dNombre').textContent = planta3dActual.nombre_comun;
        document.getElementById('planta3dCientifico').textContent = planta3dActual.nombre_cientifico;
      }
    } catch (e) {
      console.warn('Error cargando datos:', e);
    }
  }
  
  // Inicializar Three.js
  inicializarThreeJS();
}

function inicializarThreeJS() {
  const canvas = document.getElementById('canvas3d');
  
  // Escena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
  
  // Cámara
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 3, 8);
  camera.lookAt(0, 1, 0);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  
  // Luces
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);
  
  const spotLight = new THREE.SpotLight(0x8BC34A, 0.5);
  spotLight.position.set(-5, 8, 0);
  scene.add(spotLight);
  
  // Suelo
  const sueloGeometry = new THREE.CircleGeometry(8, 64);
  const sueloMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.9,
    metalness: 0.1
  });
  const suelo = new THREE.Mesh(sueloGeometry, sueloMaterial);
  suelo.rotation.x = -Math.PI / 2;
  suelo.receiveShadow = true;
  scene.add(suelo);
  
  // Crear representación 3D de la planta
  crearModeloPlanta();
  
  // Controles de órbita
  setupOrbitControls();
  
  // Ocultar loading
  document.getElementById('loading3d').style.display = 'none';
  
  // Resize
  window.addEventListener('resize', onWindowResize);
  
  // Animación
  animate();
}

function crearModeloPlanta() {
  const grupo = new THREE.Group();
  
  // Color según estado
  const colorHoja = planta3dActual?._colorEstado ? 
    new THREE.Color(planta3dActual._colorEstado) : 
    new THREE.Color(0x2E7D32);
  
  const colorTallo = new THREE.Color(0x4a3728);
  
  // Tallo principal
  const talloGeometry = new THREE.CylinderGeometry(0.08, 0.12, 3, 8);
  const talloMaterial = new THREE.MeshStandardMaterial({ 
    color: colorTallo, 
    roughness: 0.8 
  });
  const tallo = new THREE.Mesh(talloGeometry, talloMaterial);
  tallo.position.y = 1.5;
  tallo.castShadow = true;
  grupo.add(tallo);
  
  // Hojas
  const numHojas = 12;
  for (let i = 0; i < numHojas; i++) {
    const angulo = (i / numHojas) * Math.PI * 2;
    const altura = 0.5 + (i / numHojas) * 2;
    const escala = 0.3 + Math.random() * 0.4;
    
    // Geometría de hoja
    const hojaShape = new THREE.Shape();
    hojaShape.moveTo(0, 0);
    hojaShape.quadraticCurveTo(0.3, 0.5, 0, 1);
    hojaShape.quadraticCurveTo(-0.3, 0.5, 0, 0);
    
    const hojaGeometry = new THREE.ExtrudeGeometry(hojaShape, {
      depth: 0.02,
      bevelEnabled: false
    });
    
    const hojaMaterial = new THREE.MeshStandardMaterial({ 
      color: colorHoja.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.1),
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    
    const hoja = new THREE.Mesh(hojaGeometry, hojaMaterial);
    hoja.position.set(
      Math.cos(angulo) * 0.1,
      altura,
      Math.sin(angulo) * 0.1
    );
    hoja.rotation.set(
      -0.3 + Math.random() * 0.3,
      angulo,
      0.2 + Math.random() * 0.3
    );
    hoja.scale.set(escala, escala, escala);
    hoja.castShadow = true;
    grupo.add(hoja);
  }
  
  // Flor/fruto en la parte superior
  const florGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const florMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff6b6b, 
    roughness: 0.5 
  });
  const flor = new THREE.Mesh(florGeometry, florMaterial);
  flor.position.y = 3.1;
  flor.castShadow = true;
  grupo.add(flor);
  
  // Pétalos de la flor
  for (let i = 0; i < 5; i++) {
    const angulo = (i / 5) * Math.PI * 2;
    const petaloGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const petaloMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff8585, 
      roughness: 0.5 
    });
    const petalo = new THREE.Mesh(petaloGeometry, petaloMaterial);
    petalo.position.set(
      Math.cos(angulo) * 0.25,
      3.1,
      Math.sin(angulo) * 0.25
    );
    grupo.add(petalo);
  }
  
  // Maceta
  const macetaGeometry = new THREE.CylinderGeometry(0.8, 0.6, 1, 16);
  const macetaMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8d6e63, 
    roughness: 0.9 
  });
  const maceta = new THREE.Mesh(macetaGeometry, macetaMaterial);
  maceta.position.y = 0.5;
  maceta.castShadow = true;
  grupo.add(maceta);
  
  // Tierra en la maceta
  const tierraGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.1, 16);
  const tierraMaterial = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
  const tierra = new THREE.Mesh(tierraGeometry, tierraMaterial);
  tierra.position.y = 0.95;
  grupo.add(tierra);
  
  plantaMesh = grupo;
  scene.add(grupo);
}

// Controles de órbita personalizados
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = 0.005;
let cameraDistance = 8;
let cameraTheta = 0;
let cameraPhi = Math.PI / 3;

function setupOrbitControls() {
  const canvas = document.getElementById('canvas3d');
  
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    
    cameraTheta -= deltaX * rotationSpeed;
    cameraPhi += deltaY * rotationSpeed;
    cameraPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraPhi));
    
    updateCameraPosition();
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  canvas.addEventListener('wheel', (e) => {
    cameraDistance += e.deltaY * 0.01;
    cameraDistance = Math.max(3, Math.min(15, cameraDistance));
    updateCameraPosition();
  });
  
  canvas.addEventListener('dblclick', resetVista);
  
  // Touch
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });
  
  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;
    
    cameraTheta -= deltaX * rotationSpeed;
    cameraPhi += deltaY * rotationSpeed;
    cameraPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraPhi));
    
    updateCameraPosition();
    
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });
  
  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });
}

function updateCameraPosition() {
  camera.position.x = cameraDistance * Math.sin(cameraPhi) * Math.sin(cameraTheta);
  camera.position.y = cameraDistance * Math.cos(cameraPhi);
  camera.position.z = cameraDistance * Math.sin(cameraPhi) * Math.cos(cameraTheta);
  camera.lookAt(0, 1.5, 0);
}

function animate() {
  requestAnimationFrame(animate);
  
  if (autoRotate && plantaMesh) {
    plantaMesh.rotation.y += 0.005;
  }
  
  // Animación suave de las hojas
  if (plantaMesh) {
    const time = Date.now() * 0.001;
    plantaMesh.children.forEach((child, i) => {
      if (child.geometry && child.geometry.type === 'ExtrudeGeometry') {
        child.rotation.z += Math.sin(time + i) * 0.0005;
      }
    });
  }
  
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function rotarAuto() {
  autoRotate = !autoRotate;
  mostrarToast(autoRotate ? 'Rotación automática activada' : 'Rotación automática desactivada', 'info');
}

function resetVista() {
  cameraTheta = 0;
  cameraPhi = Math.PI / 3;
  cameraDistance = 8;
  autoRotate = false;
  updateCameraPosition();
  if (plantaMesh) plantaMesh.rotation.y = 0;
}

function cambiarVista() {
  const vistas = [
    { theta: 0, phi: Math.PI / 3 },
    { theta: Math.PI / 2, phi: Math.PI / 4 },
    { theta: Math.PI, phi: Math.PI / 3 },
    { theta: -Math.PI / 2, phi: Math.PI / 4 },
    { theta: 0, phi: 0.2 }
  ];
  
  const vistaActual = Math.floor(Math.random() * vistas.length);
  cameraTheta = vistas[vistaActual].theta;
  cameraPhi = vistas[vistaActual].phi;
  updateCameraPosition();
}

// Cargar Three.js
cargarScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
  .then(() => {
    // Three.js cargado
  })
  .catch(err => {
    console.error('Error cargando Three.js:', err);
    document.getElementById('loading3d').innerHTML = '<p>Error cargando el visor 3D</p>';
  });

function cargarScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
