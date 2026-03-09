const { fetchGarbadgeGeoJSON } = require("../models/garbadgeModel");

async function getGarbadge(_req, res, next) {
  try {
    const geojson = await fetchGarbadgeGeoJSON();
    if (!geojson) {
      return res.status(404).json({ message: "Layer garbadge not found in DB" });
    }
    res.json(geojson);
  } catch (error) {
    next(error);
  }
}

module.exports = { getGarbadge };
