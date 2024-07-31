// controllers/result.controller.js

const mongoose = require("mongoose");
const Election = require("../models/election.model");
const Candidate = require("../models/candidate.model");
const Portfolio = require("../models/portfolio.model");

exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Check if electionId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ message: "Invalid election ID format" });
    }

    // Find the specified election
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Find all portfolios for this election
    const portfolios = await Portfolio.find({ election: electionId });

    // Prepare the results
    const results = await Promise.all(
      portfolios.map(async (portfolio) => {
        const candidates = await Candidate.find({ portfolio: portfolio._id });

        return {
          _id: portfolio._id,
          name: portfolio.name,
          candidates: candidates.map((candidate) => ({
            _id: candidate._id,
            name: candidate.name,
            votes: candidate.votes,
            yesNoVotes:
              candidate.yesVotes !== undefined
                ? {
                    yes: candidate.yesVotes,
                    no: candidate.noVotes,
                  }
                : undefined,
          })),
        };
      })
    );

    res.status(200).json({
      electionId: election._id,
      electionName: election.title,
      status: election.status,
      startTime: election.startTime,
      endTime: election.endTime,
      totalVotes: election.totalVotes,
      results,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch election results",
        error: error.message,
      });
  }
};
