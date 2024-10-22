const Portfolio = require("../models/portfolio.model");

exports.createPortfolio = async (req, res) => {
  const { name, priority, election } = req.body;
  console.log("Received Data:", { name, priority, election });

  try {
    const portfolio = new Portfolio({
      name,
      priority,
      election,
    });

    await portfolio.save();
    res.status(201).json(portfolio);
  } catch (error) {
    console.error("Error creating portfolio:", error);
    res.status(400).json({ message: "Creation failed", error });
  }
};


// Get all portfolios
exports.getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find().populate("election");
    res.status(200).json(portfolios);
  } catch (error) {
    res.status(400).json({ message: "Error fetching portfolios", error });
  }
};

// Get portfolio by Id
exports.getPortfolioById = async (req, res) => {
  const { portfolioId } = req.params;

  try {
    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(400).json({ message: "Error fetching portfolio", error });
  }
};

// Get portfolio by Id with populated candidates
exports.getPortfolioWithCandidates = async (req, res) => {
  const { portfolioId } = req.params;

  try {
    const portfolio = await Portfolio.findById(portfolioId).populate(
      "candidates"
    );
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(400).json({ message: "Error fetching portfolio", error });
  }
};
