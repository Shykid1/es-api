const mongoose = require("mongoose");

const officialSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  STUDENTID: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  access: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "official",
  },
});

const Official =
  mongoose.models.Admin || mongoose.model("Admin", officialSchema);

module.exports = Official;
