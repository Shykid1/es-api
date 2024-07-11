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
// const corsOptions = {
//   origin: "*",
//   methods: ["GET, POST, PUT, DELETE"],
//   // allowedHeaders:
//   //   "Origin, Content-Type, Accept, Authorization, X-Requested-With",
//   // credentials: true,
//   // preflightContinue: false,
//   // optionsSuccessStatus: 204,
// };

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", require("./routes/routes"));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
