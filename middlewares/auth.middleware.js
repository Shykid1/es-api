const jwt = require("jsonwebtoken");
const Voter = require("../models/voter.model");
const SuperAdmin = require("../models/superAdmin.model");
const Official = require("../models/official.model");

exports.authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;
      if (roles.includes("voter")) {
        user = await Voter.findById(decoded.id);
      } else if (roles.includes("superAdmin")) {
        user = await SuperAdmin.findById(decoded.id);
      } else if (roles.includes("official")) {
        user = await Official.findById(decoded.id);
      }

      if (!user || (roles.length && !roles.includes(user.role))) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Authentication failed" });
    }
  };
};
