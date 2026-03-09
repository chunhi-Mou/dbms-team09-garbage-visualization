const { getLayerGeoJSON } = require("./geojsonModel");

function fetchGarbadgeGeoJSON() {
  return getLayerGeoJSON("garbadge");
}

module.exports = { fetchGarbadgeGeoJSON };

