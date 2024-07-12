const Election = require("../models/election.model");
const Candidate = require("../models/candidate.model");
const Voter = require("../models/voter.model");
const Portfolio = require("../models/portfolio.model");

// Vote for a candidate
exports.vote = async (req, res) => {
  const { candidateId } = req.params;

  try {
    // Check if the candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if Candidate portfolio name is Women Commissioner
    const voter = await Voter.findById(req.user._id);
    const portfolio = await Portfolio.findById(candidate.portfolio);
    if (portfolio && portfolio.name === "Women Commissioner") {
      // Check if the voter is male
      if (voter.GENDER === "Male") {
        return res.status(400).json({ message: "Can't vote, Female only" });
      }
    }

    // Check if the election is active
    const election = await Election.findById(candidate.election);
    if (election.status !== "active") {
      return res
        .status(400)
        .json({ message: "Can't vote, Election is not active" });
    }

    // Check if the voter has voted before
    if (voter.ISVOTED) {
      return res.status(400).json({ message: "You have already voted " });
    }

    // Vote for the candidate
    candidate.votes++;
    await candidate.save();

    // Update the voter's status to voted
    voter.ISVOTED = true;
    await voter.save();

    //Update the election's total votes
    election.totalVotes += 1;
    await election.save();

    res.status(200).json({ message: "Voted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
