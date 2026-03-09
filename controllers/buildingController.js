const { fetchBuildingGeoJSON } = require("../models/buildingModel");

async function getBuilding(_req, res, next) {
  try {
    const geojson = await fetchBuildingGeoJSON();
    if (!geojson) {
      return res.status(404).json({ message: "Layer building not found in DB" });
    }
    res.json(geojson);
  } catch (error) {
    next(error);
  }
}

module.exports = { getBuilding };
