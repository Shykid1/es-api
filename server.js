const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const dbConnect = require("./utils/db");

// Load env variables
dotenv.config();

// Connect to database
dbConnect();

// Initialize express app
const app = express();

// Cors options
const corsOpts = {
  origin: "*",

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

  allowedHeaders: ["Content-Type"],
};

// Middleware
app.use(express.json());
app.use(cors(corsOpts));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Routes
app.use("/api", require("./routes/routes"));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
