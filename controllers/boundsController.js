const { fetchBoundsGeoJSON } = require("../models/boundsModel");

async function getBounds(_req, res, next) {
  try {
    const geojson = await fetchBoundsGeoJSON();
    if (!geojson) {
      return res.status(404).json({ message: "Layer bounds not found in DB" });
    }
    res.json(geojson);
  } catch (error) {
    next(error);
  }
}

module.exports = { getBounds };
