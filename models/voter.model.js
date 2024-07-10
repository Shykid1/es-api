const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  SN: { type: Number, required: true },
  STUDENTID: { type: Number, required: true, unique: true },
  FIRSTNAME: { type: String, required: true },
  MIDDLENAME: { type: String },
  LASTNAME: { type: String, required: true },
  GENDER: { type: String, enum: ["Male", "Female"], required: true },
  LEVEL: { type: Number, required: true },
  OTP: {
    type: String,
  },
  ISVOTED: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "voter",
  },
});

const Voter = mongoose.models.Voter || mongoose.model("Voter", voterSchema);

module.exports = Voter;
