const express = require("express");
const { verifyZoomWebhookPlaceholder } = require("../controllers/zoomController");

const router = express.Router();

router.post("/webhook", verifyZoomWebhookPlaceholder);

module.exports = router;
