const styleByLayer = {
  bounds: {
    color: "#ff4d4d",
    weight: 2,
    fillColor: "#ff4d4d",
    fillOpacity: 0.14
  },
  building: {
    color: "#ffc24a",
    weight: 1.4,
    fillColor: "#ffd77d",
    fillOpacity: 0.28
  },
  road: {
    color: "#ff8c42",
    weight: 2
  },
  "instruction-generated": {
    color: "#c18fff",
    weight: 2,
    dashArray: "8 6"
  },
  garbadge: {
    radius: 8,
    color: "#4db847",
    weight: 2,
    fillColor: "#6ddd66",
    fillOpacity: 0.75
  }
};

function createGeoJsonLayer(layerName, data, onFeatureClick) {
  return L.geoJSON(data, {
    style() {
      return styleByLayer[layerName];
    },
    pointToLayer(_feature, latlng) {
      if (layerName !== "garbadge") {
        return L.circleMarker(latlng);
      }
      return L.circleMarker(latlng, styleByLayer.garbadge);
    },
    onEachFeature(feature, layer) {
      layer.on("click", () => {
        const details = {
          layer: layerName,
          geometry_type: feature.geometry ? feature.geometry.type : "Unknown",
          ...(feature.properties || {})
        };
        onFeatureClick(details);
      });
    }
  });
}

window.layerFactory = {
  createGeoJsonLayer
};
