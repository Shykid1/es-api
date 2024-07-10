const Candidate = require("../models/candidate.model");
const Portfolio = require("../models/portfolio.model");
const Election = require("../models/election.model");

// Create and Save a new Candidate
exports.createCandidate = async (req, res) => {
  const { image, name, ballot, portfolio, election } = req.body;

  try {
    const candidate = new Candidate({
      image,
      name,
      ballot,
      portfolio,
      election,
    });

    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ message: "Creation failed", error });
  }
};

// Get all candidates
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.status(200).json(candidates);
  } catch (error) {
    res.status(400).json({ message: "Error fetching candidates", error });
  }
};

// Update candidate by Id
exports.updateCandidate = async (req, res) => {
  const { candidateId } = req.params;
  const { image, name, ballot, portfolio, election } = req.body;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.image = image;
    candidate.name = name;
    candidate.ballot = ballot;
    candidate.portfolio = portfolio;
    candidate.election = election;

    await candidate.save();

    res.status(200).json(candidate);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error });
  }
};
