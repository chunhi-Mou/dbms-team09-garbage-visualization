const express = require("express");

const { getBounds } = require("../controllers/boundsController");
const { getBuilding } = require("../controllers/buildingController");
const { getGarbadge } = require("../controllers/garbadgeController");
const { getRoad } = require("../controllers/roadController");
const { getInstruction } = require("../controllers/instructionController");
const { getMeta } = require("../controllers/metaController");

const router = express.Router();

router.get("/bounds", getBounds);
router.get("/building", getBuilding);
router.get("/garbadge", getGarbadge);
router.get("/road", getRoad);
router.get("/instruction-generated", getInstruction);
router.get("/meta", getMeta);

module.exports = router;
