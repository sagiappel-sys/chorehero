const Chore = require("../models/Chore");
const User = require("../models/User");
const Notification = require("../models/Notification");

const DIFFICULTY_POINTS = { easy: 5, medium: 10, hard: 20 };

// GET /api/chores — get all chores for the user's household
const getChores = async (req, res) => {
  try {
    const chores = await Chore.find({ householdId: req.user.householdId })
      .populate("assignedTo", "name emoji")
      .populate("completedBy", "name emoji")
      .sort({ createdAt: -1 });

    res.json(chores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/chores — create a new chore (admin only)
const createChore = async (req, res) => {
  try {
    const { title, emoji, difficulty, frequency, assignedTo } = req.body;

    const chore = await Chore.create({
      householdId: req.user.householdId,
      title,
      emoji: emoji || "🧹",
      difficulty: difficulty || "medium",
      points: DIFFICULTY_POINTS[difficulty] ?? 10,
      frequency: frequency || "weekly",
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    await chore.populate("assignedTo", "name emoji");

    // Notify household
    const notification = await Notification.create({
      householdId: req.user.householdId,
      userId: req.user._id,
      message: `${req.user.name} added a new chore: ${emoji || "🧹"} ${title}`,
      emoji: emoji || "🧹",
      type: "chore_added",
    });

    // Emit via Socket.io if available
    if (req.io) {
      req.io.to(req.user.householdId.toString()).emit("chore:created", chore);
      req.io.to(req.user.householdId.toString()).emit("notification:new", notification);
    }

    res.status(201).json(chore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/chores/:id — update a chore (admin only)
const updateChore = async (req, res) => {
  try {
    const chore = await Chore.findOne({
      _id: req.params.id,
      householdId: req.user.householdId,
    });

    if (!chore) return res.status(404).json({ message: "Chore not found" });

    const { title, emoji, difficulty, frequency, assignedTo } = req.body;
    if (title !== undefined) chore.title = title;
    if (emoji !== undefined) chore.emoji = emoji;
    if (difficulty !== undefined) {
      chore.difficulty = difficulty;
      chore.points = DIFFICULTY_POINTS[difficulty] ?? chore.points;
    }
    if (frequency !== undefined) chore.frequency = frequency;
    if (assignedTo !== undefined) chore.assignedTo = assignedTo || null;

    await chore.save();
    await chore.populate("assignedTo", "name emoji");

    if (req.io) {
      req.io.to(req.user.householdId.toString()).emit("chore:updated", chore);
    }

    res.json(chore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/chores/:id — delete a chore (admin only)
const deleteChore = async (req, res) => {
  try {
    const chore = await Chore.findOneAndDelete({
      _id: req.params.id,
      householdId: req.user.householdId,
    });

    if (!chore) return res.status(404).json({ message: "Chore not found" });

    if (req.io) {
      req.io.to(req.user.householdId.toString()).emit("chore:deleted", { id: req.params.id });
    }

    res.json({ message: "Chore deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/chores/:id/complete — mark chore as done
const completeChore = async (req, res) => {
  try {
    const chore = await Chore.findOne({
      _id: req.params.id,
      householdId: req.user.householdId,
    });

    if (!chore) return res.status(404).json({ message: "Chore not found" });
    if (chore.isCompleted) return res.status(400).json({ message: "Chore already completed" });

    chore.isCompleted = true;
    chore.completedBy = req.user._id;
    chore.completedAt = new Date();
    await chore.save();

    // Award points to user
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalScore: chore.points, weeklyScore: chore.points },
    });

    // Notify household
    const notification = await Notification.create({
      householdId: req.user.householdId,
      userId: req.user._id,
      message: `${req.user.name} completed: ${chore.emoji} ${chore.title} (+${chore.points} pts)`,
      emoji: chore.emoji,
      type: "chore_completed",
    });

    await chore.populate("completedBy", "name emoji");

    if (req.io) {
      req.io.to(req.user.householdId.toString()).emit("chore:completed", chore);
      req.io.to(req.user.householdId.toString()).emit("notification:new", notification);
      req.io.to(req.user.householdId.toString()).emit("scores:updated");
    }

    res.json({ chore, pointsEarned: chore.points });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChores, createChore, updateChore, deleteChore, completeChore };
