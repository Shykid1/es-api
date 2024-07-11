const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Voter = require("../models/voter.model");
const SuperAdmin = require("../models/superAdmin.model");
const Official = require("../models/official.model");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

exports.registerSuperAdmin = async (req, res) => {
  const { userName, password } = req.body;

  try {
    // Check if the super admin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ userName });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: "Super admin already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new super admin
    const newSuperAdmin = new SuperAdmin({
      userName,
      password: hashedPassword,
    });

    await newSuperAdmin.save();

    res.status(201).json({ message: "Super admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Super admin creation failed", error });
  }
};

exports.registerOfficial = async (req, res) => {
  const { fullName, STUDENTID, password } = req.body;

  try {
    // Check if the official already exists
    const existingOfficial = await Official.findOne({ STUDENTID });
    if (existingOfficial) {
      return res.status(400).json({ message: "Official already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new official
    const newOfficial = new Official({
      fullName,
      STUDENTID,
      password: hashedPassword,
    });

    await newOfficial.save();

    res.status(201).json({ message: "Official created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Official creation failed", error });
  }
};

exports.getOfficials = async (req, res) => {
  try {
    const officials = await Official.find();
    
    res.status(201).json(officials);
  } catch (error) {
    res.status(500).json({message: "Can't fetch officials"})
  }
}

exports.registerVoter = async (req, res) => {
  const { STUDENTID, OTP } = req.body;

  // Check if the voter exists in the voters database using the STUDENTID not _id
  const existingVoter = await Voter.findOne({ STUDENTID: STUDENTID });
  if (!existingVoter) {
    return res.status(400).json({ message: "Voter does not exist" });
  }

  // Check if the voter has already voted
  if (existingVoter.ISVOTED) {
    return res.status(400).json({ message: "Voter has already voted" });
  }

  // Upddate the voter with the OTP
  const updatedVoter = await Voter.findByIdAndUpdate(existingVoter._id, {
    OTP,
  });

  res.json({ message: "OTP Generated successfully" });
};

exports.superAdminLogin = async (req, res) => {
  const { userName, password } = req.body;

  try {
    // Check if the super admin exists
    const superAdmin = await SuperAdmin.findOne({ userName });
    if (!superAdmin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      superAdmin.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(superAdmin._id, "Super");

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

exports.officialLogin = async (req, res) => {
  const { STUDENTID, password } = req.body;

  try {
    // Check if the official exists
    const official = await Official.findOne({ STUDENTID });
    if (!official) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, official.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(official._id, "Official");

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

exports.voterLogin = async (req, res) => {
  const { STUDENTID, OTP } = req.body;

  try {
    // Check if the voter exists
    const voter = await Voter.findOne({ STUDENTID });
    if (!voter) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the OTP is correct
    if (voter.OTP !== OTP) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(voter._id, "Voter");

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};
