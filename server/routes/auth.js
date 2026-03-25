const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  getMe,
  createHousehold,
  joinHousehold,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/household/create", protect, createHousehold);
router.post("/household/join", protect, joinHousehold);

module.exports = router;
