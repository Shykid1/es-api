const Portfolio = require("../models/portfolio.model");
const Candidate = require("../models/candidate.model");

const mongoose = require("mongoose");

// Replace with your actual MongoDB connection string
const mongoURI =
  "mongodb+srv://iamjimah:rxSHYBKrWQXDRzVv@infotessdb.a7c5mr0.mongodb.net/?retryWrites=true&w=majority&appName=infotessDB";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function updatePortfolios() {
  try {
    const candidates = await Candidate.find();

    for (let candidate of candidates) {
      await Portfolio.findByIdAndUpdate(
        candidate.portfolio,
        { $addToSet: { candidates: candidate._id } },
        { new: true }
      );
    }

    console.log("Portfolios updated successfully");
  } catch (error) {
    console.error("Error updating portfolios:", error);
  }
}

updatePortfolios();
