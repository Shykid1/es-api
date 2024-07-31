const Candidate = require("../models/candidate.model");
const Election = require("../models/election.model");

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
    const newEndDate = new Date(newEndTime);

    if (newEndDate <= now) {
      return res
        .status(400)
        .json({ message: "New end time must be in the future" });
    }

    election.endTime = newEndTime;
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
      active: ["paused", "ended"],
      paused: ["active", "ended"],
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
