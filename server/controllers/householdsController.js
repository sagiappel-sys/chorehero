const Household = require("../models/Household");
const User = require("../models/User");

// GET /api/households/me — get current user's household with members
const getMyHousehold = async (req, res) => {
  try {
    const household = await Household.findById(req.user.householdId).populate(
      "members",
      "name email emoji totalScore weeklyScore isAdmin"
    );

    if (!household) return res.status(404).json({ message: "Household not found" });

    res.json(household);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/households/leaderboard — get members sorted by weekly score
const getLeaderboard = async (req, res) => {
  try {
    const household = await Household.findById(req.user.householdId).populate(
      "members",
      "name emoji totalScore weeklyScore"
    );

    if (!household) return res.status(404).json({ message: "Household not found" });

    const sorted = [...household.members].sort((a, b) => b.weeklyScore - a.weeklyScore);
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/households/by-invite/:code — public, returns household info for invite landing page
const getByInviteCode = async (req, res) => {
  try {
    const household = await Household.findOne({
      inviteCode: req.params.code.toUpperCase(),
    }).populate("members", "name emoji");

    if (!household) return res.status(404).json({ message: "Invalid invite code" });

    res.json({
      _id: household._id,
      name: household.name,
      inviteCode: household.inviteCode,
      memberCount: household.members.length,
      members: household.members.map((m) => ({ _id: m._id, name: m.name, emoji: m.emoji })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/households/admins/:userId — promote or demote a member (admin only, max 3 admins)
const updateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // "promote" | "demote"

    const household = await Household.findById(req.user.householdId);
    if (!household) return res.status(404).json({ message: "Household not found" });

    if (!household.members.map(String).includes(userId)) {
      return res.status(400).json({ message: "User is not a member of this household" });
    }

    if (action === "promote") {
      if (household.adminIds.length >= 3) {
        return res.status(400).json({ message: "Maximum 3 admins allowed per household" });
      }
      if (!household.adminIds.map(String).includes(userId)) {
        household.adminIds.push(userId);
      }
      await User.findByIdAndUpdate(userId, { isAdmin: true });
    } else if (action === "demote") {
      const adminStrings = household.adminIds.map(String);
      if (adminStrings.length === 1 && adminStrings[0] === userId) {
        return res.status(400).json({ message: "Cannot remove the last admin" });
      }
      household.adminIds = household.adminIds.filter((id) => String(id) !== userId);
      await User.findByIdAndUpdate(userId, { isAdmin: false });
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'promote' or 'demote'" });
    }

    await household.save();

    const updated = await Household.findById(req.user.householdId).populate(
      "members",
      "name email emoji totalScore weeklyScore isAdmin"
    );

    if (req.io) {
      req.io.to(String(household._id)).emit("scores:updated");
    }

    res.json(updated.members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyHousehold, getLeaderboard, getByInviteCode, updateAdmin };
