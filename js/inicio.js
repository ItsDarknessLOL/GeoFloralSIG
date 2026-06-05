/**
 * inicio.js - Script específico para la página principal
 * Maneja el hero carrusel, estadísticas animadas y previews
 */

document.addEventListener('DOMContentLoaded', () => {
  inicializarHeroCarrusel();
  inicializarEstadisticas();
  cargarCatalogoPreview();
  inicializarMapaPreview();
});

// ============================================
// HERO CARRUSEL
// ============================================
const plantasHero = [
  {
    nombre: 'Áloe Yucateco',
    estado: 'Yucatán',
    imagen: 'https://images.unsplash.com/photo-1616869294368-28538e052304?w=600&h=700&fit=crop',
    color: '#2E7D32'
  },
  {
    nombre: 'Chaya Maya',
    estado: 'Quintana Roo',
    imagen: 'https://images.unsplash.com/photo-1591955506264-3f55e3d0aade?w=600&h=700&fit=crop',
    color: '#C62828'
  },
  {
    nombre: 'Passionflower',
    estado: 'Veracruz',
    imagen: 'https://images.unsplash.com/photo-1567331711402-509c12c41959?w=600&h=700&fit=crop',
    color: '#00695C'
  },
  {
    nombre: 'Hierba de Tabasco',
    estado: 'Tabasco',
    imagen: 'https://images.unsplash.com/photo-1600853729162-b631f2c8c1bc?w=600&h=700&fit=crop',
    color: '#E65100'
  },
  {
    nombre: 'Zarzaparrilla',
    estado: 'Chiapas',
    imagen: 'https://images.unsplash.com/photo-1612363229108-2aa702801c81?w=600&h=700&fit=crop',
    color: '#6A1B9A'
  }
];

let carruselActual = 0;
let carruselInterval;

function inicializarHeroCarrusel() {
  const contenedor = document.getElementById('heroCarrusel');
  const indicadores = document.getElementById('heroIndicadores');
  
  if (!contenedor || !indicadores) return;
  
  // Crear slides
  plantasHero.forEach((planta, index) => {
    const slide = document.createElement('div');
    slide.className = `hero-imagen ${index === 0 ? 'activa' : ''}`;
    slide.innerHTML = `
      <img src="${planta.imagen}" alt="${planta.nombre}" loading="lazy">
      <div class="hero-imagen-overlay"></div>
      <div class="hero-imagen-nombre">
        ${planta.nombre} <br>
        <small style="opacity: 0.8; font-weight: 400;">${planta.estado}</small>
      </div>
    `;
    contenedor.appendChild(slide);
    
    // Crear indicador
    const indicador = document.createElement('div');
    indicador.className = `hero-indicador ${index === 0 ? 'activo' : ''}`;
    indicador.addEventListener('click', () => irASlide(index));
    indicadores.appendChild(indicador);
  });
  
  // Auto-play
  iniciarCarruselAuto();
}

function irASlide(index) {
  const slides = document.querySelectorAll('.hero-imagen');
  const indicadores = document.querySelectorAll('.hero-indicador');
  
  slides.forEach((slide, i) => {
    slide.classList.toggle('activa', i === index);
  });
  
  indicadores.forEach((ind, i) => {
    ind.classList.toggle('activo', i === index);
  });
  
  carruselActual = index;
  reiniciarCarruselAuto();
}

function iniciarCarruselAuto() {
  clearInterval(carruselInterval);
  carruselInterval = setInterval(() => {
    const siguiente = (carruselActual + 1) % plantasHero.length;
    irASlide(siguiente);
  }, 4000);
}

function reiniciarCarruselAuto() {
  clearInterval(carruselInterval);
  iniciarCarruselAuto();
}

// ============================================
// ESTADÍSTICAS ANIMADAS (Contadores)
// ============================================
function inicializarEstadisticas() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animarContador(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  document.querySelectorAll('[data-contar]').forEach(el => {
    observer.observe(el);
  });
}

function animarContador(el) {
  const fin = parseInt(el.dataset.contar);
  const prefijo = el.dataset.prefix || '';
  const sufijo = el.dataset.suffix || '';
  const duracion = 2000;
  const inicio = 0;
  const inicioTiempo = performance.now();
  
  function actualizar(tiempoActual) {
    const transcurrido = tiempoActual - inicioTiempo;
    const progreso = Math.min(transcurrido / duracion, 1);
    
    // Easing ease-out
    const easeOut = 1 - Math.pow(1 - progreso, 3);
    const valorActual = Math.floor(inicio + (fin - inicio) * easeOut);
    
    el.textContent = prefijo + formatearNumero(valorActual) + sufijo;
    
    if (progreso < 1) {
      requestAnimationFrame(actualizar);
    }
  }
  
  requestAnimationFrame(actualizar);
}

// ============================================
// CATÁLOGO PREVIEW
// ============================================
async function cargarCatalogoPreview() {
  const contenedor = document.getElementById('catalogoPreview');
  if (!contenedor) return;
  
  try {
    const plantas = await cargarTodasLasPlantas();
    const populares = plantas.filter(p => p.populares).slice(0, 10);
    
    contenedor.innerHTML = populares.map(planta => `
      <a href="./pages/informacion.html?id=${planta.id}" class="planta-card" style="text-decoration: none; color: inherit;">
        <div class="planta-card-imagen">
          <img src="https://images.unsplash.com/photo-1591955506264-3f55e3d0aade?w=400&h=300&fit=crop" 
               alt="${planta.nombre_comun}" loading="lazy">
          <span class="planta-card-badge badge">${planta._estadoNombre}</span>
        </div>
        <div class="planta-card-body">
          <div class="planta-card-nombre">${planta.nombre_comun}</div>
          <div class="planta-card-cientifico">${planta.nombre_cientifico}</div>
          <div class="planta-card-tags">
            ${planta.usos_medicinales.slice(0, 3).map(u => `<span class="planta-card-tag">${u}</span>`).join('')}
          </div>
        </div>
      </a>
    `).join('');
    
  } catch (error) {
    console.error('Error cargando preview:', error);
    contenedor.innerHTML = '<p style="text-align:center; color: #999;">Cargando plantas...</p>';
  }
}

// ============================================
// MAPA PREVIEW (Leaflet)
// ============================================
let mapaPreview;

async function inicializarMapaPreview() {
  const contenedor = document.getElementById('mapaPreview');
  if (!contenedor || typeof L === 'undefined') return;
  
  try {
    // Crear mapa
    mapaPreview = L.map('mapaPreview', {
      center: [18.5, -91.0],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: false,
      dragging: true
    });
    
    // Capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(mapaPreview);
    
    // Cargar polígonos de estados
    const estados = ['yucatan', 'qroo', 'campeche', 'tabasco', 'chiapas', 'veracruz'];
    const colores = ['#2E7D32', '#C62828', '#1565C0', '#E65100', '#6A1B9A', '#00695C'];
    
    for (let i = 0; i < estados.length; i++) {
      try {
        const response = await fetch(`../assets/poligonos/${estados[i]}.geojson`);
        if (response.ok) {
          const geojson = await response.json();
          L.geoJSON(geojson, {
            style: {
              color: colores[i],
              weight: 2,
              fillColor: colores[i],
              fillOpacity: 0.3
            },
            onEachFeature: (feature, layer) => {
              layer.bindPopup(`<b>${feature.properties.estado}</b><br>${feature.properties.capital}`);
            }
          }).addTo(mapaPreview);
        }
      } catch (e) {
        console.warn(`No se pudo cargar ${estados[i]}.geojson`);
      }
    }
    
    // Agregar marcadores de plantas
    const plantas = await cargarTodasLasPlantas();
    plantas.forEach(planta => {
      if (planta.sig && planta.sig.coordenadas) {
        const marker = L.marker([planta.sig.coordenadas.lat, planta.sig.coordenadas.lng])
          .addTo(mapaPreview)
          .bindPopup(`<b>${planta.nombre_comun}</b><br><i>${planta.nombre_cientifico}</i><br><a href="./pages/informacion.html?id=${planta.id}">Ver más</a>`);
      }
    });
    
  } catch (error) {
    console.error('Error inicializando mapa preview:', error);
    contenedor.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#999;">Error cargando el mapa</div>';
  }
}
