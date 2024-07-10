const Election = require("../models/election.model");

// Create election
exports.createElection = async (req, res) => {
  const { title, startDate, endDate } = req.body;

  try {
    const election = new Election({
      title,
      startDate,
      endDate,
    });
    await election.save();
    res.status(201).json(election);
  } catch (error) {
    res.status(400).json({ message: "Creation failed", error });
  }
};

// Get all elections
exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find();
    res.status(200).json(elections);
  } catch (error) {
    res.status(400).json({ message: "Error fetching elections", error });
  }
};

// Update election by Id

exports.extendElection = async (req, res) => {
  const { electionId } = req.params;
  const { endDate } = req.body;

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    election.endDate = endDate;
    await election.save();

    res.status(200).json(election);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error });
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

    election.status = status;
    await election.save();

    res.status(200).json(election);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error });
  }
};

// Get election by Id
exports.getElectionById = async (req, res) => {
  const { electionId } = req.params;

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.status(200).json(election);
  } catch (error) {
    res.status(400).json({ message: "Error fetching election", error });
  }
};
