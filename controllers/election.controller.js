const Candidate = require("../models/candidate.model");
const Election = require("../models/election.model");
const Portfolio = require("../models/portfolio.model");
const mongoose = require("mongoose");

// Create election
exports.createElection = async (req, res) => {
  const { title, startTime, endTime,  } = req.body;

  try {
    const election = new Election({
      title,
      startTime,
      endTime,
      status: "scheduled",
      // candidates: candidates.map((candidate) => new Candidate(candidate)),
    });
    await election.save();
    res.status(201).json(election);
  } catch (error) {
    res.status(400).json({ message: "Creation failed", error: error.message });
  }
};

// Get all elections
exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ startTime: 1 });
    res.status(200).json(elections);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching elections", error: error.message });
  }
};

// Extend election
exports.extendElection = async (req, res) => {
  const { electionId } = req.params;
  const { newEndTime } = req.body;

  console.log("Extending election:", electionId);
  console.log("New end time:", newEndTime);

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const now = new Date();
    const extendedTime = new Date(newEndTime);

    if (extendedTime <= now) {
      return res
        .status(400)
        .json({ message: "New end time must be in the future" });
    }

    election.endTime = extendedTime;
    election.status = "extended";
    await election.save();

    console.log("Election extended successfully:", election);

    res.status(200).json(election);
  } catch (error) {
    console.error("Error in extendElection:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// Update election Status
exports.updateElectionStatus = async (req, res) => {  
  const { electionId } = req.params;
  const { status } = req.body;  

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const validTransitions = {
      scheduled: ["active"],
      active: ["ended"],
      extended: ["ended"],
      ended: [],
    };

    if (!validTransitions[election.status].includes(status)) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    election.status = status;
    await election.save();

    res.status(200).json(election);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// Get election by Id
exports.getElectionById = async (req, res) => {
  const { electionId } = req.params;

  try {
    const election = await Election.findById(electionId).populate("candidates");
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.status(200).json(election);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching election", error: error.message });
  }
};

// Update election statuses
exports.updateElectionStatuses = async (req, res) => {
  try {
    const now = new Date();

    // Update scheduled elections to active
    await Election.updateMany(
      { status: "scheduled", startTime: { $lte: now } },
      { $set: { status: "active" } }
    );

    // Update active elections to ended
    await Election.updateMany(
      { status: "active", endTime: { $lte: now } },
      { $set: { status: "ended" } }
    );

    // Update extended elections to ended if past new end time
    await Election.updateMany(
      { status: "extended", endTime: { $lte: now } },
      { $set: { status: "ended" } }
    );

    // Fetch updated elections
    const updatedElections = await Election.find().sort({ startTime: 1 });
    res.status(200).json(updatedElections);
  } catch (error) {
    res.status(500).json({
      message: "Error updating election statuses",
      error: error.message,
    });
  }
};
// Add this to your election.controller.js file



// Get election results
exports.getResults = async (req, res) => {
    console.log(
      "Received request for election results",
      // req.params.electionId
    );
    try {
      // const { electionId } = req.params;

      // if (!mongoose.Types.ObjectId.isValid(electionId)) {
      //   return res.status(400).json({ message: "Invalid election ID format" });
      // }

      const election = await Election.findOne({ $or: [{status: "active"}, {status: "extended"}]});

      const portfolios = await Portfolio.find({
        election: election._id,
      }).populate("candidates");

      const results = portfolios.map((portfolio) => ({
        _id: portfolio._id,
        name: portfolio.name,
        candidates: portfolio.candidates.map((candidate) => ({
          _id: candidate._id,
          name: candidate.name,
          votes: candidate.votes,
          yesNoVotes:
            candidate.yesVotes !== undefined
              && {
                  yes: candidate.yesVotes,
                  no: candidate.noVotes,
                },
        })),
      }));

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