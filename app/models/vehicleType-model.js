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
    code: {
      type: String,
      enum: ["SCV", "LCV", "ICV", "MCV", "MAV", "TT"],
    },
  },
  { timestamps: true }
);

const VehicleType = model("VehicleType", vehicleTypeSchema);

module.exports = VehicleType;
