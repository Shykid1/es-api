

const Election = require("../models/election.model");
const Candidate = require("../models/candidate.model");
const Voter = require("../models/voter.model");
const Portfolio = require("../models/portfolio.model");
const { authMiddleware } = require("../middlewares/auth.middleware");

exports.vote = [
  // authMiddleware(["voter"]),
  async (req, res) => {
    const { portfolioId } = req.params;
    const { votes } = req.body;

    console.log("Received request - portfolioId:", portfolioId);
    console.log("Received votes:", votes);

    try {
      const voter = req.user;
      console.log("Authenticated Voter:", voter);

      // Validate portfolio
      const portfolio = await Portfolio.findById(portfolioId);
      if (!portfolio) {
        console.error(`Portfolio not found for ID: ${portfolioId}`);
        return res.status(404).json({ message: "Portfolio not found" });
      }
      console.log("Found Portfolio:", portfolio);

      // Validate election
      const election = await Election.findOne({
        // portfolios: portfolioId,
        status: "active",
      });
      if (!election) {
        console.error(
          `Active election not found for portfolio: ${portfolioId}`
        );
        return res
          .status(404)
          .json({ message: "Active election not found for this portfolio" });
      }
      console.log("Found active election:", election);

      // Check for Women Commissioner restriction
      if (
        portfolio.name.toLowerCase() === "women commissioner" &&
        voter.GENDER.toLowerCase() === "male"
      ) {
        console.error("Male voter attempted to vote for Women Commissioner");
        return res
          .status(400)
          .json({ message: "Male voters cannot vote for Women Commissioner" });
      }

      // Initialize votedPortfolios if not exist
      if (!Array.isArray(voter.votedPortfolios)) {
        console.log("Initializing votedPortfolios for voter");
        voter.votedPortfolios = [];
      }

      // Check if already voted
      if (voter.votedPortfolios.includes(portfolio._id.toString())) {
        console.error(`Voter has already voted for portfolio: ${portfolioId}`);
        return res
          .status(400)
          .json({ message: "You have already voted for this portfolio" });
      }

      // Fetch candidates and determine voting type
      const candidates = await Candidate.find({ portfolio: portfolioId });
      const isMultiCandidate = candidates.length > 1;
      console.log(
        `Voting type: ${
          isMultiCandidate ? "multi-candidate" : "single-candidate"
        }`
      );

      // Process votes
      for (const vote of votes) {
        const candidate = candidates.find(
          (c) => c._id.toString() === vote.candidateId
        );
        if (!candidate) {
          console.error(`Candidate not found: ${vote.candidateId}`);
          return res
            .status(404)
            .json({ message: `Candidate ${vote.candidateId} not found` });
        }

        if (isMultiCandidate) {
          if (vote.vote.toLowerCase() !== "vote") {
            console.error(
              `Invalid vote for multi-candidate portfolio: ${vote.vote}`
            );
            return res
              .status(400)
              .json({ message: "Invalid vote for multi-candidate portfolio" });
          }
          candidate.votes = (candidate.votes || 0) + 1;
        } else {
          if (vote.vote.toLowerCase() === "yes") {
            candidate.votes = (candidate.votes || 0) + 1;
          } else if (vote.vote.toLowerCase() === "no") {
            candidate.noVotes = (candidate.noVotes || 0) + 1;
          } else {
            console.error(
              `Invalid vote for single-candidate portfolio: ${vote.vote}`
            );
            return res
              .status(400)
              .json({ message: "Invalid vote for Yes/No candidate" });
          }
        }

        console.log(`Updating candidate: ${candidate._id}`);
        await candidate.save();
      }

      // Update voter and election
      voter.votedPortfolios.push(portfolio._id);
      await voter.save();
      election.totalVotes = (election.totalVotes || 0) + 1;
      await election.save();

      console.log("Vote recorded successfully");
      res.status(200).json({ message: "Voted successfully" });
    } catch (error) {
      console.error("Error during voting:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
];