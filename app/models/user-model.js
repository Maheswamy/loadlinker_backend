const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    password: String,
    mobileNumber: Number,
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
  },
  { timestamps: true }
);

const User = model("User", userSchema);

module.exports = User;
