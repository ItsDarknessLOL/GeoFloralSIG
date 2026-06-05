/**
 * main.js - Script principal compartido
 * Maneja navegación, animaciones scroll, y funciones comunes
 */

// Estado global
const AppState = {
  plantasCache: null,
  estadoSeleccionado: null,
  temaActual: 'verde',
  mapaMovilActivo: false,
  ctrlPresionado: false
};

// Colores por estado
const COLORES_ESTADO = {
  'yucatan': { primario: '#2E7D32', secundario: '#A5D6A7', muyClaro: '#E8F5E9', nombre: 'Yucatán' },
  'qroo': { primario: '#C62828', secundario: '#FFCDD2', muyClaro: '#FFEBEE', nombre: 'Quintana Roo' },
  'campeche': { primario: '#1565C0', secundario: '#BBDEFB', muyClaro: '#E3F2FD', nombre: 'Campeche' },
  'chiapas': { primario: '#6A1B9A', secundario: '#CE93D8', muyClaro: '#F3E5F5', nombre: 'Chiapas' },
  'tabasco': { primario: '#E65100', secundario: '#FFCC80', muyClaro: '#FFF3E0', nombre: 'Tabasco' },
  'veracruz': { primario: '#00695C', secundario: '#80CBC4', muyClaro: '#E0F2F1', nombre: 'Veracruz' }
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  inicializarNavegacion();
  inicializarScrollAnimations();
  inicializarHeader();
  inicializarMobileMenu();
  inicializarTema();
});

// ============================================
// NAVEGACIÓN
// ============================================
function inicializarNavegacion() {
  // Marcar enlace activo según página actual
  const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === paginaActual || href === `.${paginaActual}` || 
        (paginaActual === '' && href === 'index.html') ||
        (paginaActual === 'index.html' && href === './index.html')) {
      link.classList.add('activo');
    }
  });
}

// ============================================
// HEADER SCROLL
// ============================================
function inicializarHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  let ultimoScroll = 0;
  
  window.addEventListener('scroll', () => {
    const scrollActual = window.scrollY;
    
    if (scrollActual > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
    
    ultimoScroll = scrollActual;
  });
}

// ============================================
// MENÚ MÓVIL
// ============================================
function inicializarMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  
  if (!toggle || !nav) return;
  
  toggle.addEventListener('click', () => {
    nav.classList.toggle('activo');
    toggle.textContent = nav.classList.contains('activo') ? '✕' : '☰';
  });
  
  // Cerrar al hacer click en un enlace
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('activo');
      toggle.textContent = '☰';
    });
  });
}

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
function inicializarScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

// ============================================
// TEMA / COLORES
// ============================================
function inicializarTema() {
  const root = document.documentElement;
  const colorEstado = localStorage.getItem('colorEstado');
  const colorSecundario = localStorage.getItem('colorSecundario');
  const colorMuyClaro = localStorage.getItem('colorMuyClaro');
  
  if (colorEstado) {
    root.style.setProperty('--color-estado', colorEstado);
    if (colorSecundario) root.style.setProperty('--color-estado-claro', colorSecundario);
    if (colorMuyClaro) root.style.setProperty('--color-estado-muy-claro', colorMuyClaro);
  }
}

function aplicarTemaEstado(estadoKey) {
  const root = document.documentElement;
  const colores = COLORES_ESTADO[estadoKey];
  
  if (colores) {
    root.style.setProperty('--color-estado', colores.primario);
    root.style.setProperty('--color-estado-claro', colores.secundario);
    root.style.setProperty('--color-estado-muy-claro', colores.muyClaro);
    
    localStorage.setItem('colorEstado', colores.primario);
    localStorage.setItem('colorSecundario', colores.secundario);
    localStorage.setItem('colorMuyClaro', colores.muyClaro);
    
    AppState.temaActual = estadoKey;
    AppState.estadoSeleccionado = estadoKey;
  }
}

function resetTema() {
  const root = document.documentElement;
  root.style.setProperty('--color-estado', 'var(--verde-principal)');
  root.style.setProperty('--color-estado-claro', 'var(--verde-claro)');
  root.style.setProperty('--color-estado-muy-claro', 'var(--verde-muy-claro)');
  
  localStorage.removeItem('colorEstado');
  localStorage.removeItem('colorSecundario');
  localStorage.removeItem('colorMuyClaro');
  
  AppState.temaActual = 'verde';
  AppState.estadoSeleccionado = null;
}

// ============================================
// CARGAR PLANTAS
// ============================================
async function cargarTodasLasPlantas() {
  if (AppState.plantasCache) return AppState.plantasCache;
  
  const estados = ['yucatan', 'qroo', 'campeche', 'chiapas', 'tabasco', 'veracruz'];
  const todasLasPlantas = [];
  
  try {
    for (const estado of estados) {
      const response = await fetch(`../json/${estado}.json`);
      if (response.ok) {
        const data = await response.json();
        data.plantas.forEach(planta => {
          planta._estado = estado;
          planta._estadoNombre = data.estado;
          planta._colorEstado = data.color_tema;
          todasLasPlantas.push(planta);
        });
      }
    }
    
    AppState.plantasCache = todasLasPlantas;
    return todasLasPlantas;
  } catch (error) {
    console.error('Error cargando plantas:', error);
    return [];
  }
}

// ============================================
// UTILIDADES
// ============================================

// Búsqueda fuzzy simple (distancia de Levenshtein)
function distanciaLevenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i-1] === a[j-1] 
        ? matrix[i-1][j-1]
        : Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function busquedaFuzzy(query, texto) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Coincidencia exacta o substring
  if (t.includes(q)) return 1.0;
  
  // Distancia Levenshtein
  const dist = distanciaLevenshtein(q, t.substring(0, Math.min(t.length, q.length + 3)));
  if (dist <= 2) return 0.7 - (dist * 0.1);
  
  return 0;
}

function normalizarTexto(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatearNumero(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ============================================
// MAPA UTILIDADES
// ============================================
function inicializarControlMapa(map) {
  // Ctrl para mover en desktop
  let ctrlPresionado = false;
  let mapaBloqueado = true;
  
  map.dragging.disable();
  map.scrollWheelZoom.disable();
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Control') {
      ctrlPresionado = true;
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      document.querySelector('.mapa-wrapper')?.classList.remove('mapa-ctrl-bloqueado');
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Control') {
      ctrlPresionado = false;
      if (mapaBloqueado) {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
      }
    }
  });
  
  // Botón móvil
  const btnMovil = document.getElementById('btnMapaMovil');
  if (btnMovil) {
    btnMovil.addEventListener('click', () => {
      AppState.mapaMovilActivo = !AppState.mapaMovilActivo;
      
      if (AppState.mapaMovilActivo) {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        btnMovil.textContent = '🔒 Bloquear mapa';
      } else {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        btnMovil.textContent = '🔓 Mover mapa';
      }
    });
  }
  
  // Mostrar hint inicial
  const mapWrapper = document.querySelector('.mapa-wrapper');
  if (mapWrapper && window.innerWidth > 768) {
    mapWrapper.classList.add('mapa-ctrl-bloqueado');
  }
  
  return { ctrlPresionado, mapaBloqueado };
}

// ============================================
// GENERAR ESTRELLAS (para hero)
// ============================================
function generarEstrellas(contenedor, cantidad = 50) {
  for (let i = 0; i < cantidad; i++) {
    const estrella = document.createElement('div');
    estrella.style.cssText = `
      position: absolute;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      background: rgba(255,255,255,${Math.random() * 0.8 + 0.2});
      border-radius: 50%;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite alternate;
      animation-delay: ${Math.random() * 3}s;
    `;
    contenedor.appendChild(estrella);
  }
}

// ============================================
// NOTIFICACIONES (Toast)
// ============================================
function mostrarToast(mensaje, tipo = 'info') {
  const colores = {
    info: '#2E7D32',
    error: '#C62828',
    warning: '#E65100',
    success: '#00695C'
  };
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    padding: 14px 24px;
    background: ${colores[tipo] || colores.info};
    color: white;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    animation: fadeInRight 0.3s ease forwards;
  `;
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeInRight 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Exportar funciones globales
window.AppState = AppState;
window.COLORES_ESTADO = COLORES_ESTADO;
window.aplicarTemaEstado = aplicarTemaEstado;
window.resetTema = resetTema;
window.cargarTodasLasPlantas = cargarTodasLasPlantas;
window.busquedaFuzzy = busquedaFuzzy;
window.normalizarTexto = normalizarTexto;
window.distanciaLevenshtein = distanciaLevenshtein;
window.debounce = debounce;
window.formatearNumero = formatearNumero;
window.inicializarControlMapa = inicializarControlMapa;
window.generarEstrellas = generarEstrellas;
window.mostrarToast = mostrarToast;
