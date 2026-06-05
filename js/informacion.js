/**
 * informacion.js - Página de detalle de planta
 * Hero animado, tabs con información completa
 */

let plantaActual = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarPlanta();
});

// ============================================
// CARGAR PLANTA
// ============================================
async function cargarPlanta() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (!id) {
    mostrarError('No se especificó una planta');
    return;
  }
  
  try {
    const plantas = await cargarTodasLasPlantas();
    plantaActual = plantas.find(p => p.id === id);
    
    if (!plantaActual) {
      mostrarError('Planta no encontrada');
      return;
    }
    
    // Aplicar tema del estado
    aplicarTemaEstado(plantaActual._estado);
    
    // Renderizar hero
    renderizarHero();
    
    // Renderizar tabs
    renderizarGeneral();
    renderizarBiologia();
    renderizarMedicina();
    renderizarHistoria();
    renderizarEconomia();
    renderizarSIG();
    renderizarHumanidades();
    
  } catch (error) {
    console.error('Error cargando planta:', error);
    mostrarError('Error al cargar la información');
  }
}

function mostrarError(msg) {
  document.getElementById('plantaNombre').textContent = msg;
  document.getElementById('plantaCientifico').textContent = '';
}

// ============================================
// HERO
// ============================================
function renderizarHero() {
  const p = plantaActual;
  
  // Nombre
  document.getElementById('plantaNombre').textContent = p.nombre_comun;
  
  // Científico con animación letra por letra
  const cientifico = document.getElementById('plantaCientifico');
  cientifico.textContent = '';
  const texto = p.nombre_cientifico;
  let i = 0;
  const interval = setInterval(() => {
    cientifico.textContent += texto[i];
    i++;
    if (i >= texto.length) clearInterval(interval);
  }, 50);
  
  // Meta badges
  const meta = document.getElementById('plantaMeta');
  meta.innerHTML = `
    <span class="hero-planta-badge">🗺️ ${p._estadoNombre}</span>
    <span class="hero-planta-badge">🌱 ${p.familia}</span>
    <span class="hero-planta-badge">📏 ${p.altura}</span>
    <span class="hero-planta-badge">${p.abundancia}</span>
    ${p.populares ? '<span class="hero-planta-badge">⭐ Popular</span>' : ''}
  `;
  
  // Background
  const bg = document.getElementById('heroBg');
  bg.style.backgroundImage = `url(https://images.unsplash.com/photo-${getImagenId(p.id)}?w=1200&h=800&fit=crop)`;
}

function getImagenId(id) {
  const ids = {
    'yuc_001': '1616869294368-28538e052304',
    'qro_001': '1591955506264-3f55e3d0aade',
    'cam_001': '1600853729162-b631f2c8c1bc',
    'chi_001': '1612363229108-2aa702801c81',
    'tab_001': '1567331711402-509c12c41959',
    'ver_001': '1591955506264-3f55e3d0aade'
  };
  return ids[id] || '1591955506264-3f55e3d0aade';
}

// ============================================
// TABS
// ============================================
function cambiarTab(tab) {
  // Botones
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('activo'));
  event.target.classList.add('activo');
  
  // Paneles
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('activo'));
  document.getElementById(`tab-${tab}`).classList.add('activo');
  
  // Inicializar mapa si es SIG
  if (tab === 'sig') {
    setTimeout(inicializarMapaPlanta, 100);
  }
}

// ============================================
// TAB: GENERAL
// ============================================
function renderizarGeneral() {
  const p = plantaActual;
  document.getElementById('contenidoGeneral').innerHTML = `
    <div class="info-card">
      <h4>📝 Descripción</h4>
      <p>${p.descripcion}</p>
    </div>
    <div class="info-card">
      <h4>🗺️ Distribución</h4>
      <p>${p.distribucion}</p>
      <p style="margin-top: 8px;"><strong>Hábitat:</strong> ${p.habitat}</p>
    </div>
    <div class="info-card">
      <h4>📊 Datos Generales</h4>
      <table class="datos-tabla">
        <tr><td>Nombre común</td><td>${p.nombre_comun}</td></tr>
        <tr><td>Nombre científico</td><td style="font-style: italic;">${p.nombre_cientifico}</td></tr>
        <tr><td>Familia</td><td>${p.familia}</td></tr>
        <tr><td>Género</td><td>${p.genero}</td></tr>
        <tr><td>Especie</td><td>${p.especie}</td></tr>
        <tr><td>Altura</td><td>${p.altura}</td></tr>
        <tr><td>Abundancia</td><td>${p.abundancia}</td></tr>
        <tr><td>Conservación</td><td>${p.estado_conservacion}</td></tr>
      </table>
    </div>
    <div class="info-card">
      <h4>⚠️ Contraindicaciones</h4>
      <p style="color: #C62828;">${p.contraindicaciones}</p>
    </div>
  `;
}

// ============================================
// TAB: BIOLOGÍA
// ============================================
function renderizarBiologia() {
  const bio = plantaActual.biologia;
  document.getElementById('contenidoBiologia').innerHTML = `
    <div class="info-card">
      <h4>🔄 Ciclo de Vida</h4>
      <p>${bio.ciclo_vida}</p>
    </div>
    <div class="info-card">
      <h4>🌸 Reproducción</h4>
      <p>${bio.reproduccion}</p>
    </div>
    <div class="info-card">
      <h4>🐝 Polinizadores</h4>
      <p>${bio.polinizadores}</p>
    </div>
    <div class="info-card">
      <h4>🌺 Época de Floración</h4>
      <p>${bio.epoca_floracion}</p>
    </div>
    <div class="info-card">
      <h4>🔧 Adaptaciones</h4>
      <p>${bio.adaptaciones}</p>
    </div>
  `;
}

// ============================================
// TAB: MEDICINA
// ============================================
function renderizarMedicina() {
  const p = plantaActual;
  document.getElementById('contenidoMedicina').innerHTML = `
    <div class="info-card">
      <h4>💊 Usos Medicinales</h4>
      <ul>
        ${p.usos_medicinales.map(u => `<li>${u}</li>`).join('')}
      </ul>
    </div>
    <div class="info-card">
      <h4>🍵 Preparados</h4>
      <ul>
        ${p.preparados.map(prep => `<li>${prep}</li>`).join('')}
      </ul>
    </div>
    <div class="info-card">
      <h4>🧪 Componentes Activos</h4>
      <div class="componentes-tags">
        ${p.componentes_activos.map(c => `<span class="componente-tag">${c}</span>`).join('')}
      </div>
    </div>
    <div class="info-card">
      <h4>⚠️ Contraindicaciones</h4>
      <p style="color: #C62828;">${p.contraindicaciones}</p>
    </div>
  `;
}

// ============================================
// TAB: HISTORIA
// ============================================
function renderizarHistoria() {
  const hist = plantaActual.historia;
  document.getElementById('contenidoHistoria').innerHTML = `
    <div class="info-card">
      <h4>📜 Origen</h4>
      <p>${hist.origen}</p>
    </div>
    <div class="info-card">
      <h4>🏺 Usos Tradicionales</h4>
      <p>${hist.usos_tradicionales}</p>
    </div>
    <div class="info-card">
      <h4>📚 Menciones Históricas</h4>
      <p>${hist.menciones_historicas}</p>
    </div>
    <div class="info-card">
      <h4>🏛️ Evidencia Arqueológica</h4>
      <p>${hist.evidencia_arqueologica}</p>
    </div>
  `;
}

// ============================================
// TAB: ECONOMÍA
// ============================================
function renderizarEconomia() {
  const eco = plantaActual.economia;
  document.getElementById('contenidoEconomia').innerHTML = `
    <div class="eco-stats">
      <div class="eco-stat">
        <div class="eco-stat-valor">${eco.precio_mercado_kg}</div>
        <div class="eco-stat-label">Precio/kg</div>
      </div>
      <div class="eco-stat">
        <div class="eco-stat-valor">${eco.produccion_anual_ton}</div>
        <div class="eco-stat-label">Ton/año</div>
      </div>
      <div class="eco-stat">
        <div class="eco-stat-valor">${eco.valor_exportacion}</div>
        <div class="eco-stat-label">Exportación</div>
      </div>
      <div class="eco-stat">
        <div class="eco-stat-valor">${eco.empleos_generados}</div>
        <div class="eco-stat-label">Empleos</div>
      </div>
    </div>
    
    <div class="info-grid">
      <div class="info-card">
        <h4>📈 Producción y Mercado</h4>
        <table class="datos-tabla">
          <tr><td>Precio de mercado</td><td>${eco.precio_mercado_kg}</td></tr>
          <tr><td>Producción anual</td><td>${eco.produccion_anual_ton} toneladas</td></tr>
          <tr><td>Valor de exportación</td><td>${eco.valor_exportacion} USD/año</td></tr>
          <tr><td>Empleos generados</td><td>${eco.empleos_generados}</td></tr>
        </table>
      </div>
      <div class="info-card">
        <h4>🏪 Mercados de Destino</h4>
        <p>${eco.mercados_destino}</p>
      </div>
      <div class="info-card" style="grid-column: 1 / -1;">
        <h4>📦 Productos Derivados</h4>
        <div class="componentes-tags">
          ${eco.productos_derivados.map(prod => `<span class="componente-tag">${prod}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

// ============================================
// TAB: SIG
// ============================================
function renderizarSIG() {
  const sig = plantaActual.sig;
  document.getElementById('contenidoSIG').innerHTML = `
    <div class="info-grid">
      <div class="info-card">
        <h4>📍 Coordenadas</h4>
        <table class="datos-tabla">
          <tr><td>Latitud</td><td>${sig.coordenadas.lat.toFixed(4)}°</td></tr>
          <tr><td>Longitud</td><td>${sig.coordenadas.lng.toFixed(4)}°</td></tr>
        </table>
      </div>
      <div class="info-card">
        <h4>🗺️ Datos SIG</h4>
        <table class="datos-tabla">
          <tr><td>Zona de distribución</td><td>${sig.zona_distribucion}</td></tr>
          <tr><td>Tipo de suelo</td><td>${sig.tipo_suelo}</td></tr>
          <tr><td>Clima</td><td>${sig.clima}</td></tr>
          <tr><td>Precipitación anual</td><td>${sig.precipitacion_anual}</td></tr>
          <tr><td>Altitud</td><td>${sig.altitud}</td></tr>
        </table>
      </div>
    </div>
    <div class="info-card" style="margin-top: 24px;">
      <h4>🗺️ Mapa de Localización</h4>
      <div class="mapa-planta" id="mapaPlantaDetalle"></div>
    </div>
  `;
}

let mapaPlanta;

function inicializarMapaPlanta() {
  const contenedor = document.getElementById('mapaPlantaDetalle');
  if (!contenedor || !plantaActual?.sig?.coordenadas) return;
  
  if (mapaPlanta) {
    mapaPlanta.remove();
  }
  
  const { lat, lng } = plantaActual.sig.coordenadas;
  
  mapaPlanta = L.map('mapaPlantaDetalle', {
    center: [lat, lng],
    zoom: 8,
    zoomControl: true
  });
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
  }).addTo(mapaPlanta);
  
  // Marcador
  const icono = L.divIcon({
    className: 'custom-marker',
    html: `<div style="width: 36px; height: 36px; background: ${plantaActual._colorEstado}; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🌿</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });
  
  L.marker([lat, lng], { icon })
    .addTo(mapaPlanta)
    .bindPopup(`<b>${plantaActual.nombre_comun}</b><br>${plantaActual._estadoNombre}`);
  
  // Cargar polígono del estado
  cargarPoligonoEstado(plantaActual._estado);
}

async function cargarPoligonoEstado(estado) {
  try {
    const response = await fetch(`../assets/poligonos/${estado}.geojson`);
    if (response.ok && mapaPlanta) {
      const geojson = await response.json();
      L.geoJSON(geojson, {
        style: {
          color: plantaActual._colorEstado,
          weight: 2,
          fillColor: plantaActual._colorEstado,
          fillOpacity: 0.15
        }
      }).addTo(mapaPlanta);
    }
  } catch (e) {
    console.warn('Error cargando polígono:', e);
  }
}

// ============================================
// TAB: HUMANIDADES
// ============================================
function renderizarHumanidades() {
  const hum = plantaActual.humanidades;
  document.getElementById('contenidoHumanidades').innerHTML = `
    <div class="info-card">
      <h4>🎭 Significado Cultural</h4>
      <p>${hum.significado_cultural}</p>
    </div>
    <div class="info-card">
      <h4>👥 Relevancia Social</h4>
      <p>${hum.relevancia_social}</p>
    </div>
    <div class="info-card">
      <h4>🙏 Prácticas Tradicionales</h4>
      <p>${hum.practicas_tradicionales}</p>
    </div>
    <div class="info-card">
      <h4>📚 Saberes Indígenas</h4>
      <p>${hum.saberes_indigenas}</p>
    </div>
  `;
}

// ============================================
// VER EN 3D
// ============================================
function verEn3D() {
  if (plantaActual) {
    window.location.href = `visor3d.html?id=${plantaActual.id}`;
  }
}
