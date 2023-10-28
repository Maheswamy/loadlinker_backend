const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const vehicleTypeSchema = new Schema(
  {
    maximumWeight: String,
    name: {
      type: String,
      enum: [
        "Small Commercial Vehicle",
        "Light Commercial Vehicle",
        "Intermediate Commercial Vehicle",
        "Medium Commercial Vehicle",
        "Multi Axle Vehicle",
        "Tractor Trailer",
      ],
    },
    pricePerKiloMeter: {
      type: Number,
      enum: [15,18, 20, 24, 30, 35],
    },
    range: {
      type: String,
      enum: [
        "8 Ton < GVW ≤ 16.02 Ton",
        "Upto 3.5 Ton",
        "18.5 Ton GVW",
        "28 Ton < GVW ≤ 49 Ton",
        "30 Ton < GCW ≤ 55 Ton",
        "3.5 Ton < GVW ≤ 8 Ton",
      ],
    },
    code: {
      type: String,
      enum: ["SCV", "LCV", "ICV", "MCV", "MAV", "TT"],
    },
  },
  { timestamps: true }
);

const VehicleType = model("VehicleType", vehicleTypeSchema);

module.exports = VehicleType;
