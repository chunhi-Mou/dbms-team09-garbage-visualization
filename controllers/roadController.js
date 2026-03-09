const { fetchRoadGeoJSON } = require("../models/roadModel");

async function getRoad(_req, res, next) {
  try {
    const geojson = await fetchRoadGeoJSON();
    if (!geojson) {
      return res.status(404).json({ message: "Layer road not found in DB" });
    }
    res.json(geojson);
  } catch (error) {
    next(error);
  }
}

module.exports = { getRoad };
