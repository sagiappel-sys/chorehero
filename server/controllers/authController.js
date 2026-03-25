const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Household = require("../models/Household");
const Notification = require("../models/Notification");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, emoji } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password, emoji: emoji || "😊" });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      emoji: user.emoji,
      householdId: user.householdId,
      isAdmin: user.isAdmin,
      totalScore: user.totalScore,
      weeklyScore: user.weeklyScore,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      emoji: user.emoji,
      householdId: user.householdId,
      isAdmin: user.isAdmin,
      totalScore: user.totalScore,
      weeklyScore: user.weeklyScore,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate("householdId");
  res.json(user);
};

// POST /api/auth/household/create
const createHousehold = async (req, res) => {
  try {
    const { householdName } = req.body;
    const userId = req.user._id;

    if (req.user.householdId) {
      return res.status(400).json({ message: "You already belong to a household" });
    }

    const household = await Household.create({
      name: householdName,
      adminId: userId,
      members: [userId],
    });

    await User.findByIdAndUpdate(userId, { householdId: household._id, isAdmin: true });

    res.status(201).json(household);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/household/join
const joinHousehold = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;

    if (req.user.householdId) {
      return res.status(400).json({ message: "You already belong to a household" });
    }

    const household = await Household.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!household) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    if (household.members.includes(userId)) {
      return res.status(400).json({ message: "You are already in this household" });
    }

    household.members.push(userId);
    await household.save();

    await User.findByIdAndUpdate(userId, { householdId: household._id, isAdmin: false });

    // Create a join notification
    await Notification.create({
      householdId: household._id,
      userId,
      message: `${req.user.name} joined the household! 🎉`,
      emoji: req.user.emoji || "😊",
      type: "member_joined",
    });

    res.json(household);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, createHousehold, joinHousehold };
