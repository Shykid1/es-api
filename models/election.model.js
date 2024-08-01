const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
   
    status: {
      type: String,
      enum: ["scheduled", "active", "ended", "extended"],
      default: "scheduled",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
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
