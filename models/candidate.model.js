const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    candidateId: {
      type: String,
      required: true,
    },
    portfolio: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
  },
  { timestamps: true }
);

const Candidate =
  mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
