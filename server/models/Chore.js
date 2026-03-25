const mongoose = require("mongoose");

const FREQUENCIES = ["daily", "weekly", "monthly", "once"];
const DIFFICULTY_POINTS = { easy: 5, medium: 10, hard: 20 };

const choreSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Chore title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    emoji: {
      type: String,
      default: "🧹",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    points: {
      type: Number,
    },
    frequency: {
      type: String,
      enum: FREQUENCIES,
      default: "weekly",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate points from difficulty before saving
choreSchema.pre("save", function (next) {
  if (!this.points) {
    this.points = DIFFICULTY_POINTS[this.difficulty] ?? 10;
  }
  next();
});

module.exports = mongoose.model("Chore", choreSchema);
