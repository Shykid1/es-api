const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const SuperAdmin =
  mongoose.models.SuperAdmin || mongoose.model("SuperAdmin", superAdminSchema);

module.exports = SuperAdmin;
