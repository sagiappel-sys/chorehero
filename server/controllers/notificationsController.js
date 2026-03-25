const Notification = require("../models/Notification");

// GET /api/notifications — get recent notifications for household
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ householdId: req.user.householdId })
      .populate("userId", "name emoji")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notifications/read — mark all as read for current user
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { householdId: req.user.householdId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, markAllRead };
