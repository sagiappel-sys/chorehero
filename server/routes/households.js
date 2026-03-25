const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getMyHousehold, getLeaderboard } = require("../controllers/householdsController");

router.get("/me", protect, getMyHousehold);
router.get("/leaderboard", protect, getLeaderboard);

module.exports = router;
