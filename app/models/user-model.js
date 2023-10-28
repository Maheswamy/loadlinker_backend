const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    password: String,
    mobileNumber: String,
    email: String,
    lastedited: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    strike: Number,
    role: {
      type: String,
      enum: ["admin", "owner", "shipper"],
    },
    reviews: {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
    otp: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
      enum: [true, false],
    },
    vehicles: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  },

  { timestamps: true }
);

const User = model("User", userSchema);

module.exports = User;
