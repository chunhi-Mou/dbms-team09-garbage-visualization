const map = L.map("map", { zoomControl: false }).setView([20.832, 106.581], 15);
const activeLayers = {};
const rawLayerData = {};
const layerOrder = ["bounds", "building", "road", "instruction-generated", "garbadge"];

L.control.zoom({ position: "bottomright" }).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function wireLayerToggles() {
  const toggles = document.querySelectorAll("input[data-layer]");

  toggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const layerName = toggle.getAttribute("data-layer");
      const layer = activeLayers[layerName];
      if (!layer) {
        return;
      }

      if (toggle.checked) {
        layer.addTo(map);
      } else {
        map.removeLayer(layer);
      }
    });
  });
}

function focusMainExtent() {
  const boundsLayer = activeLayers.bounds;
  if (!boundsLayer) {
    return;
  }

  const bounds = boundsLayer.getBounds();
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [20, 20] });
  }
}

function clearRenderedLayers() {
  Object.keys(activeLayers).forEach((layerName) => {
    map.removeLayer(activeLayers[layerName]);
    delete activeLayers[layerName];
  });
}

function getToggleStatus(layerName) {
  const toggle = document.querySelector(`input[data-layer="${layerName}"]`);
  if (!toggle) {
    return true;
  }
  return toggle.checked;
}

function renderLayers({ fitBounds = false } = {}) {
  clearRenderedLayers();

  for (const layerName of layerOrder) {
    const data = rawLayerData[layerName];
    if (!data) {
      continue;
    }

    const layer = window.layerFactory.createGeoJsonLayer(
      layerName,
      data,
      window.layerUi.renderFeatureInfo
    );

    activeLayers[layerName] = layer;
    if (getToggleStatus(layerName)) {
      layer.addTo(map);
    }
  }

  if (fitBounds) {
    focusMainExtent();
  }
}

async function loadLayerData() {
  for (const layerName of layerOrder) {
    const result = await window.layerApi.fetchLayerData(layerName);
    if (result.missing) {
      window.layerUi.markLayerUnavailable(layerName, result.message);
      continue;
    }
    rawLayerData[layerName] = result.data;
  }
}

async function loadDbMeta() {
  if (!window.layerApi || !window.layerUi || !window.layerUi.renderDbMeta) {
    return;
  }

  try {
    const meta = await window.layerApi.fetchDbMeta();
    if (!meta) {
      window.layerUi.showDbMetaError("Không có metadata DB từ API /api/meta.");
      return;
    }
    window.layerUi.renderDbMeta(meta);
  } catch (error) {
    window.layerUi.showDbMetaError(
      `Không đọc được metadata DB. Hãy kiểm tra PostgreSQL/PostGIS. (${error.message})`
    );
  }
}

async function init() {
  try {
    await Promise.all([loadLayerData(), loadDbMeta()]);
    renderLayers({ fitBounds: true });
    wireLayerToggles();
    window.layerUi.resetFeatureInfo();
  } catch (error) {
    console.error(error);
    window.layerUi.showLoadError(error.message);
  }
}

init();
