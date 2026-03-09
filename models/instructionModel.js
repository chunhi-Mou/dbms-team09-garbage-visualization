const { getLayerGeoJSON } = require("./geojsonModel");

function fetchInstructionGeoJSON() {
  return getLayerGeoJSON('"instruction-generated"');
}

module.exports = { fetchInstructionGeoJSON };

