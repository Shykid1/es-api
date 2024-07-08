const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Voter = require("../models/voter.model");
const Admin = require("../models/admin.model");
const SuperAdmin = require("../models/superAdmin.model");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

exports.registerUser = async (req, res) => {
  const { email, password, role, name, studentId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();

    let profile;
    if (role === "Voter") {
      profile = new Voter({ name, studentId, userId: user._id });
    } else if (role === "Admin") {
      profile = new Admin({ name, userId: user._id });
    } else if (role === "Super") {
      profile = new SuperAdmin({ name, userId: user._id });
    }
    await profile.save();

    const token = generateToken(user._id, user.role);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: "Registration failed", error });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password, studentId } = req.body;

  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (studentId) {
      const voter = await Voter.findOne({ studentId }).populate("userId");
      user = voter ? voter.userId : null;
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: "Login failed", error });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // Implement logout logic as needed
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error });
  }
};
