const Candidate = require("../models/candidate.model");
const Election = require("../models/election.model");

exports.createCandidate = async (req, res) => {
  const { image, name, candidateId, portfolio, electionId } = req.body;

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const candidate = new Candidate({
      image,
      name,
      candidateId,
      portfolio,
      electionId,
    });

    await candidate.save();

    election.candidates.push(candidate._id);
    await election.save();

    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ message: "Creation failed", error });
  }
};

exports.getCandidatesByElection = async (req, res) => {
  const { electionId } = req.params;

  try {
    const candidates = await Candidate.find({ electionId });

    if (!candidates) {
      return res
        .status(404)
        .json({ message: "No candidates found for this election" });
    }

    res.status(200).json(candidates);
  } catch (error) {
    res.status(400).json({ message: "Error fetching candidates", error });
  }
};

exports.updateCandidate = async (req, res) => {
  const { candidateId } = req.params;
  const { image, name, portfolio } = req.body;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.image = image || candidate.image;
    candidate.name = name || candidate.name;
    candidate.portfolio = portfolio || candidate.portfolio;

    await candidate.save();

    res.status(200).json(candidate);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error });
  }
};

exports.deleteCandidate = async (req, res) => {
  const { candidateId } = req.params;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    await candidate.remove();
    await Election.updateOne(
      { _id: candidate.electionId },
      { $pull: { candidates: candidate._id } }
    );

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Deletion failed", error });
  }
};
