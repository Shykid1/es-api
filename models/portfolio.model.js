// const mongoose = require("mongoose");

// const portfolioSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   priority: {
//     type: Number,
//     required: true,
//   },
// });

// const Portfolio =
//   mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema);

// module.exports = Portfolio;
const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: Number,
    required: true,
  },
  candidates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },
  ],
});

const Portfolio =
  mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;
