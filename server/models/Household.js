const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

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
      default: () => randomUUID().slice(0, 8).toUpperCase(), // e.g. "A3F7B2C1"
    },
    adminIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
