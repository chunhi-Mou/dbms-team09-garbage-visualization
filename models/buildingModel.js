const { getLayerGeoJSON } = require("./geojsonModel");

function fetchBuildingGeoJSON() {
  return getLayerGeoJSON("building");
}

module.exports = { fetchBuildingGeoJSON };

