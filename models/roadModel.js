const { getLayerGeoJSON } = require("./geojsonModel");

function fetchRoadGeoJSON() {
  return getLayerGeoJSON("road");
}

module.exports = { fetchRoadGeoJSON };

