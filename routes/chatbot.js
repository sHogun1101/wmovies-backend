const express = require("express");
const cors = require("cors");
const router = express.Router();
router.use(cors());
const chatGptController = require("../services/chatGPTController");

router.post("/look-up-word", chatGptController.askToChatGpt);
router.post("/look-up-couplet", chatGptController.askToChatGptCouplet);
module.exports = router;
