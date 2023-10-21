const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const vehicleSchema = new Schema(
  {
    vehicleNumber: String,
    rcNumber: String,
    permitType: String,
    permittedLoadCapacity: String,
    rcImage: [String],
    vehicalType: {
      type: Schema.Types.ObjectId,
      ref: "VehicleModel",
    },
    vehiclePhoto: [String],
    status: {
      type: String,
      default: "pending",
      enum: ["reject", "pending", "approved"],
    },
    lastEditBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    loaded: Boolean,
    OwnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Vehicle=model('Vehicle',vehicleSchema)

module.exports=Vehicle
