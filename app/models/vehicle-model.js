const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const vehicleSchema = new Schema(
  {
    vehicleNumber: String,
    rcNumber: String,
    permittedLoadCapacity: Number,
    rcImages: [{ url: String, key: String }],
    vehicalType: {
      type: Schema.Types.ObjectId,
      ref: "VehicleModel",
    },
    vehicleImages: [{ url: String, key: String }],
    status: {
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
    OwnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Vehicle = model("Vehicle", vehicleSchema);

module.exports = Vehicle;
