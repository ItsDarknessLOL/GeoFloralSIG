/**
 * mapa.js - Mapa interactivo con Leaflet
 * Polígonos, puntos, filtros y control Ctrl para mover
 */

let mapa;
let capasBase = {};
let capaActiva;
let poligonosEstados = {};
let marcadoresPlantas = [];
let capaPoligonos;
let capaMarcadores;
let ctrlPresionado = false;
let mapaBloqueado = true;
let visualizacionActual = { puntos: true, poligonos: true, heatmap: false };

document.addEventListener('DOMContentLoaded', () => {
  inicializarMapa();
});

async function inicializarMapa() {
  // Crear mapa
  mapa = L.map('mapaPrincipal', {
    center: [18.5, -91.0],
    zoom: 7,
    zoomControl: true,
    dragging: false, // Bloqueado por defecto
    scrollWheelZoom: false,
    doubleClickZoom: true
  });
  
  // Capas base
  capasBase = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18
    }),
    satelital: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri',
      maxZoom: 18
    }),
    oscuro: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO',
      maxZoom: 18
    }),
    topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap',
      maxZoom: 17
    })
  };
  
  // Capa por defecto
  capaActiva = capasBase.osm;
  capaActiva.addTo(mapa);
  
  // Grupos de capas
  capaPoligonos = L.layerGroup().addTo(mapa);
  capaMarcadores = L.layerGroup().addTo(mapa);
  
  // Cargar datos
  await cargarPoligonosEstados();
  await cargarMarcadoresPlantas();
  llenarFiltroEspecies();
  
  // Control Ctrl para mover
  inicializarControlTeclado();
  
  // Detectar si es móvil
  if (window.innerWidth <= 768) {
    document.getElementById('btnMapaMovil').style.display = 'block';
  }
  
  // Mostrar hint en desktop
  if (window.innerWidth > 768) {
    const hint = document.getElementById('mapaHint');
    hint.style.display = 'block';
    setTimeout(() => {
      hint.style.opacity = '0';
      hint.style.transition = 'opacity 1s ease';
      setTimeout(() => hint.style.display = 'none', 1000);
    }, 4000);
  }
}

// ============================================
// CONTROL DE TECLADO (Ctrl para mover)
// ============================================
function inicializarControlTeclado() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Control' && mapaBloqueado) {
      ctrlPresionado = true;
      mapa.dragging.enable();
      mapa.scrollWheelZoom.enable();
      document.getElementById('mapaPrincipal').style.cursor = 'grab';
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Control' && mapaBloqueado) {
      ctrlPresionado = false;
      mapa.dragging.disable();
      mapa.scrollWheelZoom.disable();
      document.getElementById('mapaPrincipal').style.cursor = 'default';
    }
  });
  
  // También permitir click y arrastrar con Ctrl
  const mapaEl = document.getElementById('mapaPrincipal');
  mapaEl.addEventListener('mousedown', (e) => {
    if (ctrlPresionado) {
      mapaEl.style.cursor = 'grabbing';
    }
  });
  
  mapaEl.addEventListener('mouseup', () => {
    if (ctrlPresionado) {
      mapaEl.style.cursor = 'grab';
    }
  });
}

// ============================================
// BOTÓN MÓVIL
// ============================================
function toggleMapaMovil() {
  const btn = document.getElementById('btnMapaMovil');
  
  if (mapaBloqueado) {
    mapaBloqueado = false;
    mapa.dragging.enable();
    mapa.scrollWheelZoom.enable();
    btn.textContent = '🔒 Bloquear mapa';
    mostrarToast('Mapa desbloqueado. Puedes moverte libremente.', 'info');
  } else {
    mapaBloqueado = true;
    mapa.dragging.disable();
    mapa.scrollWheelZoom.disable();
    btn.textContent = '🔓 Desbloquear mapa';
  }
}

// ============================================
// CARGAR POLÍGONOS
// ============================================
async function cargarPoligonosEstados() {
  const estados = [
    { key: 'yucatan', color: '#2E7D32', nombre: 'Yucatán' },
    { key: 'qroo', color: '#C62828', nombre: 'Quintana Roo' },
    { key: 'campeche', color: '#1565C0', nombre: 'Campeche' },
    { key: 'chiapas', color: '#6A1B9A', nombre: 'Chiapas' },
    { key: 'tabasco', color: '#E65100', nombre: 'Tabasco' },
    { key: 'veracruz', color: '#00695C', nombre: 'Veracruz' }
  ];
  
  for (const estado of estados) {
    try {
      const response = await fetch(`../assets/poligonos/${estado.key}.geojson`);
      if (response.ok) {
        const geojson = await response.json();
        const layer = L.geoJSON(geojson, {
          style: {
            color: estado.color,
            weight: 3,
            fillColor: estado.color,
            fillOpacity: 0.25,
            dashArray: null
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`
              <div style="font-family: Inter, sans-serif;">
                <h4 style="margin: 0 0 4px; color: ${estado.color};">${feature.properties.estado}</h4>
                <p style="margin: 0; font-size: 0.85rem;">Capital: ${feature.properties.capital}</p>
                <a href="catalogo.html?estado=${estado.key}" style="color: ${estado.color}; font-size: 0.8rem;">Ver plantas →</a>
              </div>
            `);
            
            layer.on('mouseover', () => {
              layer.setStyle({ fillOpacity: 0.4, weight: 4 });
            });
            
            layer.on('mouseout', () => {
              layer.setStyle({ fillOpacity: 0.25, weight: 3 });
            });
          }
        });
        
        poligonosEstados[estado.key] = layer;
        layer.addTo(capaPoligonos);
      }
    } catch (e) {
      console.warn(`Error cargando polígono ${estado.key}:`, e);
    }
  }
}

// ============================================
// CARGAR MARCADORES
// ============================================
async function cargarMarcadoresPlantas() {
  try {
    const plantas = await cargarTodasLasPlantas();
    
    const iconoVerde = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width: 32px; height: 32px; background: #2E7D32; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">🌿</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    
    plantas.forEach(planta => {
      if (planta.sig && planta.sig.coordenadas) {
        const { lat, lng } = planta.sig.coordenadas;
        
        const marker = L.marker([lat, lng], { icon: iconoVerde })
          .bindPopup(`
            <div class="popup-planta" style="font-family: Inter, sans-serif; min-width: 200px;">
              <h4>${planta.nombre_comun}</h4>
              <div class="cientifico">${planta.nombre_cientifico}</div>
              <span class="estado-tag">${planta._estadoNombre}</span>
              <p style="font-size: 0.8rem; margin: 6px 0; color: #666;">${planta.usos_medicinales[0]}</p>
              <a href="informacion.html?id=${planta.id}" style="color: ${planta._colorEstado}; font-size: 0.85rem; font-weight: 600;">Ver ficha completa →</a>
            </div>
          `, { className: 'popup-planta' });
        
        marcadoresPlantas.push({ marker, planta });
        marker.addTo(capaMarcadores);
      }
    });
    
  } catch (error) {
    console.error('Error cargando marcadores:', error);
  }
}

// ============================================
// LLENAR FILTRO DE ESPECIES
// ============================================
async function llenarFiltroEspecies() {
  const select = document.getElementById('filtroEspecieMapa');
  if (!select) return;
  
  try {
    const plantas = await cargarTodasLasPlantas();
    plantas.forEach(planta => {
      const option = document.createElement('option');
      option.value = planta.id;
      option.textContent = `${planta.nombre_comun} (${planta.nombre_cientifico})`;
      select.appendChild(option);
    });
  } catch (e) {
    console.warn('Error llenando filtro de especies:', e);
  }
}

// ============================================
// CAMBIAR CAPA BASE
// ============================================
function cambiarCapaBase(tipo) {
  if (capaActiva) {
    mapa.removeLayer(capaActiva);
  }
  
  capaActiva = capasBase[tipo];
  if (capaActiva) {
    capaActiva.addTo(mapa);
  }
  
  // Actualizar botones
  document.querySelectorAll('[data-capa]').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.capa === tipo);
  });
}

// ============================================
// TOGGLE POLÍGONOS
// ============================================
function togglePoligonos(estado) {
  // Actualizar botones
  document.querySelectorAll('[data-poligono]').forEach(btn => {
    btn.classList.remove('activo');
  });
  
  if (estado === 'todos') {
    // Mostrar todos
    Object.values(poligonosEstados).forEach(layer => {
      if (!capaPoligonos.hasLayer(layer)) {
        capaPoligonos.addLayer(layer);
      }
    });
    document.querySelector('[data-poligono="todos"]').classList.add('activo');
  } else {
    // Mostrar solo el seleccionado
    Object.entries(poligonosEstados).forEach(([key, layer]) => {
      if (key === estado) {
        if (!capaPoligonos.hasLayer(layer)) {
          capaPoligonos.addLayer(layer);
        }
      } else {
        if (capaPoligonos.hasLayer(layer)) {
          capaPoligonos.removeLayer(layer);
        }
      }
    });
    document.querySelector(`[data-poligono="${estado}"]`).classList.add('activo');
  }
}

// ============================================
// TOGGLE VISUALIZACIÓN
// ============================================
function toggleVisual(tipo) {
  const btn = document.querySelector(`[data-visual="${tipo}"]`);
  
  if (tipo === 'puntos') {
    visualizacionActual.puntos = !visualizacionActual.puntos;
    btn.classList.toggle('activo', visualizacionActual.puntos);
    
    if (visualizacionActual.puntos) {
      mapa.addLayer(capaMarcadores);
    } else {
      mapa.removeLayer(capaMarcadores);
    }
  } else if (tipo === 'poligonos') {
    visualizacionActual.poligonos = !visualizacionActual.poligonos;
    btn.classList.toggle('activo', visualizacionActual.poligonos);
    
    if (visualizacionActual.poligonos) {
      mapa.addLayer(capaPoligonos);
    } else {
      mapa.removeLayer(capaPoligonos);
    }
  } else if (tipo === 'heatmap') {
    visualizacionActual.heatmap = !visualizacionActual.heatmap;
    btn.classList.toggle('activo', visualizacionActual.heatmap);
    
    if (visualizacionActual.heatmap) {
      generarHeatmap();
    } else {
      if (window.capaHeatmap) {
        mapa.removeLayer(window.capaHeatmap);
      }
    }
  }
}

// ============================================
// HEATMAP SIMULADO
// ============================================
async function generarHeatmap() {
  if (window.capaHeatmap) {
    mapa.removeLayer(window.capaHeatmap);
  }
  
  const puntos = [];
  marcadoresPlantas.forEach(({ planta }) => {
    if (planta.sig && planta.sig.coordenadas) {
      // Crear múltiples puntos alrededor para simular zona de abundancia
      const base = planta.sig.coordenadas;
      for (let i = 0; i < 15; i++) {
        puntos.push([
          base.lat + (Math.random() - 0.5) * 0.8,
          base.lng + (Math.random() - 0.5) * 0.8
        ]);
      }
    }
  });
  
  // Usar círculos con gradiente como simulación de heatmap
  window.capaHeatmap = L.layerGroup();
  
  puntos.forEach(([lat, lng]) => {
    const circle = L.circle([lat, lng], {
      radius: 5000 + Math.random() * 10000,
      fillColor: `hsla(${120 + Math.random() * 60}, 70%, 50%, 0.3)`,
      color: 'transparent',
      fillOpacity: 0.2
    });
    circle.addTo(window.capaHeatmap);
  });
  
  window.capaHeatmap.addTo(mapa);
}

// ============================================
// FILTRAR ESPECIE EN MAPA
// ============================================
function filtrarEspecieMapa() {
  const id = document.getElementById('filtroEspecieMapa').value;
  
  if (!id) {
    // Mostrar todos
    marcadoresPlantas.forEach(({ marker }) => {
      if (!capaMarcadores.hasLayer(marker)) {
        capaMarcadores.addLayer(marker);
      }
    });
    return;
  }
  
  // Mostrar solo la especie seleccionada
  marcadoresPlantas.forEach(({ marker, planta }) => {
    if (planta.id === id) {
      if (!capaMarcadores.hasLayer(marker)) {
        capaMarcadores.addLayer(marker);
      }
      // Centrar en el marcador
      const latlng = marker.getLatLng();
      mapa.setView(latlng, 10);
    } else {
      if (capaMarcadores.hasLayer(marker)) {
        capaMarcadores.removeLayer(marker);
      }
    }
  });
}

// ============================================
// BUSCAR EN MAPA
// ============================================
function buscarEnMapa(query) {
  if (!query.trim()) {
    // Mostrar todos
    marcadoresPlantas.forEach(({ marker }) => {
      if (!capaMarcadores.hasLayer(marker)) {
        capaMarcadores.addLayer(marker);
      }
    });
    return;
  }
  
  const q = normalizarTexto(query);
  let encontrado = false;
  
  marcadoresPlantas.forEach(({ marker, planta }) => {
    const nombreComun = normalizarTexto(planta.nombre_comun);
    const nombreCientifico = normalizarTexto(planta.nombre_cientifico);
    
    const coincide = nombreComun.includes(q) || nombreCientifico.includes(q) ||
      distanciaLevenshtein(q, nombreComun.substring(0, Math.min(nombreComun.length, q.length + 3))) <= 2;
    
    if (coincide) {
      if (!capaMarcadores.hasLayer(marker)) {
        capaMarcadores.addLayer(marker);
      }
      if (!encontrado) {
        const latlng = marker.getLatLng();
        mapa.setView(latlng, 9);
        encontrado = true;
      }
    } else {
      if (capaMarcadores.hasLayer(marker)) {
        capaMarcadores.removeLayer(marker);
      }
    }
  });
}
