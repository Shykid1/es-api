const Election = require("../models/election.model");
const Candidate = require("../models/candidate.model");
const Voter = require("../models/voter.model");

exports.createElection = async (req, res) => {
  const { image, title, description, startDate, endDate } = req.body;

  try {
    const election = new Election({
      image,
      title,
      description,
      startDate,
      endDate,
      admin: req.user._id,
    });
    await election.save();
    res.status(201).json(election);
  } catch (error) {
    res.status(400).json({ message: "Creation failed", error });
  }
};

exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find().populate("admin", "name");
    res.status(200).json(elections);
  } catch (error) {
    res.status(400).json({ message: "Error fetching elections", error });
  }
};

exports.getElectionById = async (req, res) => {
  const { electionId } = req.params;

  try {
    const election = await Election.findById(electionId).populate(
      "admin",
      "name"
    );
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.status(200).json(election);
  } catch (error) {
    res.status(400).json({ message: "Error fetching election", error });
  }
};

exports.updateElection = async (req, res) => {
  const { electionId } = req.params;
  const { image, title, description, startDate, endDate } = req.body;

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    election.image = image;
    election.title = title;
    election.description = description;
    election.startDate = startDate;
    election.endDate = endDate;
    await election.save();

    res.status(200).json(election);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error });
  }
};

exports.vote = async (req, res) => {
  const { candidateId } = req.body;

  try {
    const voter = await Voter.findOne({ userId: req.user._id });

    if (voter.isVoted) {
      return res.status(400).json({ message: "Already voted" });
    }

    const candidate = await Candidate.findById(candidateId);
    candidate.votes += 1;
    await candidate.save();

    voter.isVoted = true;
    await voter.save();

    res.status(200).json({ message: "Vote successful" });
  } catch (error) {
    res.status(400).json({ message: "Vote failed", error });
  }
};
