const Portfolio = require("../models/portfolio.model");

// Get all portfolios
exports.getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find();
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
