const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/agentic", aiController.processAgenticTask);
router.post("/fast", aiController.generateFastAnalysis);
router.post("/plan", aiController.createPlan);

module.exports = router;
