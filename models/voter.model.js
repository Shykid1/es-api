const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVoted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Voter = mongoose.models.Voter || mongoose.model("Voter", voterSchema);

module.exports = Voter;
