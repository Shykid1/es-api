const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const xlsx = require("xlsx");
const multer = require("multer");
const fs = require("fs");
const dbConnect = require("./utils/db");
const Voter = require("./models/voter.model"); // Ensure the Voter model is imported

// Load environment variables
dotenv.config();

// Connect to database
dbConnect();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
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

    const voters = [];
    for (const row of data) {
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
          console.error(`Error: Field ${field} is missing for record`, voter);
          throw new Error(`Field ${field} is missing for some records`);
        }
      }

      voters.push(voter);
    }

    // Save data to MongoDB
    await Voter.insertMany(voters);

    // Clean up temporary file
    fs.unlinkSync(file.path);

    res.status(200).json({ message: "File uploaded and data saved", voters });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to upload and save data",
      error: error.message,
    });
  }
});

// Routes
app.use("/api", require("./routes/routes"));

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
