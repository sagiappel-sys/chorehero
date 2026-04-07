const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Household = require("../models/Household");
const Notification = require("../models/Notification");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

const userPayload = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  emoji: user.emoji,
  householdId: user.householdId,
  isAdmin: user.isAdmin,
  totalScore: user.totalScore,
  weeklyScore: user.weeklyScore,
  token,
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, emoji } = req.body;
    const emailToUse = email?.trim() || null;

    if (emailToUse) {
      const existing = await User.findOne({ email: emailToUse });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const user = await User.create({
      name,
      email: emailToUse,
      password,
      emoji: emoji || "😊",
    });

    res.status(201).json(userPayload(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login  (email + password)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required. No email? Sign in via your household invite link." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json(userPayload(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login-with-name  (name + inviteCode + password — for kids without email)
const loginWithName = async (req, res) => {
  try {
    const { name, inviteCode, password } = req.body;

    if (!name || !inviteCode || !password) {
      return res.status(400).json({ message: "Name, invite code, and password are required" });
    }

    const household = await Household.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    // Escape regex special chars in name
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const user = await User.findOne({
      _id: { $in: household.members },
      name: { $regex: new RegExp(`^${escaped}$`, "i") },
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid name or password" });
    }

    res.json(userPayload(user, generateToken(user._id)));
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
      adminIds: [userId],
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

    if (household.members.map(String).includes(String(userId))) {
      return res.status(400).json({ message: "You are already in this household" });
    }

    household.members.push(userId);
    await household.save();

    await User.findByIdAndUpdate(userId, { householdId: household._id, isAdmin: false });

    await Notification.create({
      householdId: household._id,
      userId,
      message: `${req.user.name} joined the household! 🎉`,
      emoji: req.user.emoji || "😊",
      type: "member_joined",
    });

    if (req.io) {
      req.io.to(String(household._id)).emit("notification:new", {
        message: `${req.user.name} joined the household! 🎉`,
        emoji: req.user.emoji || "😊",
        type: "member_joined",
      });
    }

    res.json(household);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, loginWithName, getMe, createHousehold, joinHousehold };
