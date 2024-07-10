const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "superAdmin",
    },
  },
  { timestamps: true }
);

const SuperAdmin =
  mongoose.models.SuperAdmin || mongoose.model("SuperAdmin", superAdminSchema);

module.exports = SuperAdmin;
