const express = require("express");
const router = express.Router();
const { vote } = require("../controllers/vote.controller");
const election = require("../controllers/election.controller");
const candidate = require("../controllers/candidate.controller");
const user = require("../controllers/user.controller");
const {results} = require("../controllers/results.controller.js");
const auth = require("../middlewares/auth.middleware");
const portfolio = require("../controllers/portfolios.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Vote
router.post("/vote/:portfolioId", authMiddleware(["voter"]), vote);

// Portfolio
router.get(
  "/portfolios",
  auth.authMiddleware(["official", "superAdmin"]),
  portfolio.getPortfolios
);

// Add Portfolio
router.post(
  "/portfolios",
  auth.authMiddleware(["official", "superAdmin"]),
  portfolio.createPortfolio
);

// Get All portfolios
router.get(
  "/portfolio/:portfolioId",
  auth.authMiddleware(["official", "superAdmin"]),
  portfolio.getPortfolioById
);

// Get a portfolio
router.get(
  "/portfolio/:portfolioId/with-candidates",
  auth.authMiddleware(["official", "superAdmin"]),
  portfolio.getPortfolioWithCandidates
);

// Election
router.post(
  "/election",
  auth.authMiddleware(["superAdmin"]),
  election.createElection
);



// Get election results
router.get(
  "/results",
  auth.authMiddleware(["superAdmin"]),
  election.getResults
);
router.get("/election/:electionId", election.getElectionById);
router.get(
  "/election",
  auth.authMiddleware(["official", "superAdmin"]),
  election.getElections
);

router.put(
  "/election/extend/:electionId",
  auth.authMiddleware(["superAdmin"]),
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
  "/candidates",
  auth.authMiddleware(["official", "superAdmin"]),
  // uploadImage.single(),
  candidate.getCandidates
);

router.put(
  "/candidate/:candidateId",
  auth.authMiddleware(["official", "superAdmin"]),
  candidate.updateCandidate
);

// Voter
router.post("/auth/register/voter", user.registerVoter);
router.get("/voter", user.getVoters);

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
router.post("/upload", upload.single("file"), user.uploadVoters);

// Official
router.post("/auth/register/official", user.registerOfficial);
router.get("/official", user.getOfficials);
router.put("/official/access/:studentId", auth.authMiddleware(["superAdmin"]), user.grantOfficialAccess)
router.put("/official/revoke/:studentId", auth.authMiddleware(["superAdmin"]), user.revokeOfficialAccess)

// Super Admin
router.post("/auth/register/super-admin", user.registerSuperAdmin);

// Super Admin Login
router.post("/auth/super-admin/login", user.superAdminLogin);

// Official Login
router.post("/auth/official/login", user.officialLogin);

// Voter Login
router.post("/auth/voter/login", user.voterLogin);

module.exports = router;
