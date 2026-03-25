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

module.exports = { getMyHousehold, getLeaderboard };
