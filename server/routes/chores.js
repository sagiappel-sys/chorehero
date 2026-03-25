const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getChores,
  createChore,
  updateChore,
  deleteChore,
  completeChore,
} = require("../controllers/choresController");

router.get("/", protect, getChores);
router.post("/", protect, adminOnly, createChore);
router.put("/:id", protect, adminOnly, updateChore);
router.delete("/:id", protect, adminOnly, deleteChore);
router.post("/:id/complete", protect, completeChore);

module.exports = router;
