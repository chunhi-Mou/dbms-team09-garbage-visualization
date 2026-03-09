const { getDbMeta } = require("../models/metaModel");

async function getMeta(_req, res, next) {
  try {
    const meta = await getDbMeta();
    res.json(meta);
  } catch (error) {
    next(error);
  }
}

module.exports = { getMeta };
