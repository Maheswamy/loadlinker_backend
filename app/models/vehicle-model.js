const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const vehicleSchema = new Schema(
  {
    vehicleNumber: String,
    rcNumber: String,
    permittedLoadCapacity: Number,
    rcImages: [{ url: String, key: String }],
    vehicleType: {
      type: Schema.Types.ObjectId,
      ref: "VehicleModel",
    },
    permit: {
      type: [Schema.Types.ObjectId],
      ref: "Permit",
    },
    vehicleImages: [{ url: String, key: String }],
    isVerified: {
      type: String,
      default: "pending",
      enum: ["reject", "pending", "approved"],
    },
    lastEditBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    loaded: {
      type: Boolean,
      default: false,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    delete: {
      type: Boolean,
      default: false,
    },
    reasonForRejection: {
      type: String,
    },
  },
  { timestamps: true }
);

const Vehicle = model("Vehicle", vehicleSchema);

module.exports = Vehicle;
