
const mongoose = require("mongoose");
const Portfolio = require("../models/portfolio.model");
const Candidate = require("../models/candidate.model");
const Election = require("../models/election.model"); // Make sure to import the Election model

const mongoURI =
  "mongodb+srv://iamjimah:rxSHYBKrWQXDRzVv@infotessdb.a7c5mr0.mongodb.net/?retryWrites=true&w=majority&appName=infotessDB";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function updatePortfoliosAndCandidates() {
  try {
    // Find the active or extended election
    const activeElection = await Election.findOne({
      $or: [{ status: "active" }, { status: "extended" }],
    });

    if (!activeElection) {
      console.log("No active or extended election found");
      return;
    }

    const candidates = await Candidate.find();
    const portfolios = await Portfolio.find();

    for (let candidate of candidates) {
      if (candidate.portfolio) {
        await Portfolio.findByIdAndUpdate(
          candidate.portfolio,
          {
            $addToSet: { candidates: candidate._id },
            $set: { election: activeElection._id }, // Set the election field
          },
          { new: true }
        );
      } else {
        console.log(`Candidate ${candidate._id} has no associated portfolio`);
      }
    }

    // Update portfolios that might not have candidates
    for (let portfolio of portfolios) {
      if (!portfolio.election) {
        await Portfolio.findByIdAndUpdate(
          portfolio._id,
          { $set: { election: activeElection._id } },
          { new: true }
        );
      }
    }

    console.log("Portfolios and candidates updated successfully");
  } catch (error) {
    console.error("Error updating portfolios and candidates:", error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

updatePortfoliosAndCandidates();
