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
      ],
    },
    pricePerKiloMeter: {
      type: Number,
      enum: [15, 18, 20, 24, 30],
    },
    minimumWeight: Number,
    maximumWeight: Number,
    code: {
      type: String,
      enum: ["SCV", "LCV", "ICV", "MCV", "MAV"],
    },
  },
  { timestamps: true }
);

const VehicleType = model("VehicleType", vehicleTypeSchema);

module.exports = VehicleType;
