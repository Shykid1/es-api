const express = require("express");
const router = express.Router();
const { vote } = require("../controllers/vote.controller");
const election = require("../controllers/election.controller");
const candidate = require("../controllers/candidate.controller");
const user = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const portfolio = require("../controllers/portfolios.controller");

// Vote
router.post("/vote/:candidateId", auth.authMiddleware(["voter"]), vote);

// Portfolio
router.get(
  "/portfolio",
  auth.authMiddleware(["official", "superAdmin"]),
  portfolio.getPortfolios
);
router.get(
  "/portfolio/:portfolioId",
  auth.authMiddleware(["official", "superAdmin"]),
  portfolio.getPortfolioById
);

// Election
router.post(
  "/election",
  auth.authMiddleware(["superAdmin"]),
  election.createElection
);
router.get("/election/:electionId", election.getElectionById);
router.get(
  "/election",
  auth.authMiddleware(["official", "superAdmin"]),
  election.getElections
);
router.put(
  "/election/extend/:electionId",
  auth.authMiddleware(["official"]),
  election.extendElection
);
router.put(
  "/election/status/:electionId",
  auth.authMiddleware(["superAdmin"]),
  election.updateElectionStatus
);

// Candidate
router.post(
  "/candidate",
  auth.authMiddleware(["official", "superAdmin"]),
  candidate.createCandidate
);
router.get(
  "/candidate",
  auth.authMiddleware(["official", "superAdmin"]),
  candidate.getCandidates
);
router.put(
  "/candidate/:candidateId",
  auth.authMiddleware(["official", "superAdmin"]),
  candidate.updateCandidate
);

// Voter
router.post(
  "/auth/register/voter",
  auth.authMiddleware(["official"]),
  user.registerVoter
);

// Official
router.post("/auth/register/official", user.registerOfficial);

// Super Admin
router.post("/auth/register/super-admin", user.registerSuperAdmin);

// Super Admin Login
router.post("/auth/super-admin/login", user.superAdminLogin);

// Official Login
router.post("/auth/official/login", user.officialLogin);

// Voter Login
router.post("/auth/voter/login", user.voterLogin);

module.exports = router;
