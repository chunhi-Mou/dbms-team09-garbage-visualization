const { getLayerGeoJSON } = require("./geojsonModel");

function fetchBoundsGeoJSON() {
  return getLayerGeoJSON("bounds");
}

module.exports = { fetchBoundsGeoJSON };

