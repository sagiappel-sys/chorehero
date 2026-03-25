const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const householdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Household name is required"],
      trim: true,
      maxlength: [100, "Household name cannot exceed 100 characters"],
    },
    inviteCode: {
      type: String,
      unique: true,
      default: () => uuidv4().slice(0, 8).toUpperCase(), // e.g. "A3F7B2C1"
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Household", householdSchema);
