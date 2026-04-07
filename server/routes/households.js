const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getMyHousehold,
  getLeaderboard,
  getByInviteCode,
  updateAdmin,
} = require("../controllers/householdsController");

router.get("/me", protect, getMyHousehold);
router.get("/leaderboard", protect, getLeaderboard);
router.get("/by-invite/:code", getByInviteCode); // public — no auth required
router.put("/admins/:userId", protect, adminOnly, updateAdmin);

module.exports = router;
