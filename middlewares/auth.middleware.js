const jwt = require("jsonwebtoken");
const Voter = require("../models/voter.model");
const SuperAdmin = require("../models/superAdmin.model");
const Official = require("../models/official.model");

exports.authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("No token provided");
        return res.status(401).json({ message: "No token provided" });
      }

      // In auth.middleware.js
     

      const token = authHeader.split(" ")[1];
      console.log("Token received:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      let user;
      if (roles.includes("voter")) {
        user = await Voter.findById(decoded.id);
      } else if (roles.includes("superAdmin")) {
        user = await SuperAdmin.findById(decoded.id);
      } else if (roles.includes("official")) {
        user = await Official.findById(decoded.id);
      }

      if (!user) {
        console.error("User not found:", decoded.id);
        return res.status(403).json({ message: "User not found" });
      }

      if (roles.length && !roles.includes(user.role)) {
        console.error("Access denied for user role:", user.role);
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Authentication failed:", error.message);
      res.status(401).json({ message: "Authentication failed" });
    }
  };
  
};
