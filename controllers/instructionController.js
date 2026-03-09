const { fetchInstructionGeoJSON } = require("../models/instructionModel");

async function getInstruction(_req, res, next) {
  try {
    const geojson = await fetchInstructionGeoJSON();
    if (!geojson) {
      return res
        .status(404)
        .json({ message: "Layer instruction-generated not found in DB" });
    }
    res.json(geojson);
  } catch (error) {
    next(error);
  }
}

module.exports = { getInstruction };
