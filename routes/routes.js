const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const electionController = require("../controllers/election.controller");
const candidateController = require("../controllers/candidate.controller");

const router = express.Router();

// User routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/logout", authMiddleware(), userController.logoutUser);

// Election routes
router.post(
  "/elections",
  authMiddleware(["Admin", "Super"]),
  electionController.createElection
);
router.get("/elections", authMiddleware(), electionController.getElections);
router.get(
  "/elections/:electionId",
  authMiddleware(),
  electionController.getElectionById
);
router.put(
  "/elections/:electionId",
  authMiddleware(["Admin", "Super"]),
  electionController.updateElection
);
router.post("/vote", authMiddleware(["Voter"]), electionController.vote);

// Candidate routes
router.post(
  "/candidates",
  authMiddleware(["Admin", "Super"]),
  candidateController.createCandidate
);
router.get(
  "/candidates/election/:electionId",
  authMiddleware(),
  candidateController.getCandidatesByElection
);
router.put(
  "/candidates/:candidateId",
  authMiddleware(["Admin", "Super"]),
  candidateController.updateCandidate
);
router.delete(
  "/candidates/:candidateId",
  authMiddleware(["Admin", "Super"]),
  candidateController.deleteCandidate
);

module.exports = router;
