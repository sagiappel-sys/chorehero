const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getNotifications, markAllRead } = require("../controllers/notificationsController");

router.get("/", protect, getNotifications);
router.put("/read", protect, markAllRead);

module.exports = router;
