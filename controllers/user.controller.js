
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const xlsx = require("xlsx");
const multer = require("multer");
const Voter = require("../models/voter.model");
const SuperAdmin = require("../models/superAdmin.model");
const Official = require("../models/official.model");

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

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

    res.status(200).json(officials);
  } catch (error) {
    res.status(500).json({ message: "Can't fetch officials" });
  }
};

exports.registerVoter = async (req, res) => {
  try {
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

    // Update the voter with the OTP
    const updatedVoter = await Voter.findByIdAndUpdate(existingVoter._id, {
      OTP,
    });

    res
      .status(200)
      .json({ message: "OTP Generated successfully", updatedVoter });
  } catch (error) {
    res.status(500).json({ message: "Can't fetch officials" });
  }
};

exports.getVoters = async (req, res) => {
  try {
    const voters = await Voter.find();

    res.status(200).json(voters);
  } catch (error) {
    res.status(500).json({ message: "Fetching voters failed", error });
  }
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

    // Return voter data along with token
    res.json({ token, user: voter });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

// New uploadVoters function
exports.uploadVoters = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse the uploaded file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    // Validate and transform data
    const requiredFields = [
      "SN",
      "STUDENTID",
      "FIRSTNAME",
      "LASTNAME",
      "GENDER",
      "LEVEL",
    ];
    const voters = data.map((row) => {
      const voter = {
        SN: row.SN,
        STUDENTID: row.STUDENTID,
        FIRSTNAME: row.FIRSTNAME,
        MIDDLENAME: row.MIDDLENAME || "",
        LASTNAME: row.LASTNAME,
        GENDER: row.GENDER,
        LEVEL: row.LEVEL,
      };

      // Check for missing required fields
      for (let field of requiredFields) {
        if (!voter[field]) {
          return { error: `Field ${field} is missing in one of the records` };
        }
      }

      return voter;
    });

    const errors = voters.filter((voter) => voter.error);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation error", errors });
    }

    // Save data to MongoDB
    await Voter.insertMany(voters);

    res.status(200).json({ message: "File uploaded and data saved", voters });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Failed to upload and save data",
        error: error.message,
      });
  }
};
exports.vote = async (req, res) => {
  try {
    const voterId = req.user.id;
    const { candidateId } = req.params;

    console.log(`Voter ID: ${voterId}, Candidate ID: ${candidateId}`);
    console.log("Request body:", req.body);

    // Check if the voter has already voted
    const voter = await Voter.findById(voterId);
    if (voter.ISVOTED) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // Record the vote (this is a simplified example)
    const candidate = await candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.votes += 1;
    await candidate.save();

    // Mark the voter as having voted
    voter.ISVOTED = true;
    await voter.save();

    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.error("Vote recording failed:", error.message);
    res.status(500).json({ message: "Vote recording failed", error });
  }
};
