const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    candidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "active", "ended", "extended"],
      default: "scheduled",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Election =
  mongoose.models.Election || mongoose.model("Election", electionSchema);

module.exports = Election;
