const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    emoji: {
      type: String,
      default: "🔔",
    },
    type: {
      type: String,
      enum: ["chore_completed", "chore_added", "chore_deleted", "member_joined", "general"],
      default: "general",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
