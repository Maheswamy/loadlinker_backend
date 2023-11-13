const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bidSchema = new Schema({
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  bidAmount: Number,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  enquiryId: {
    type: Schema.Types.ObjectId,
    ref: "Enquiry",
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "rejected", "approved"],
  },
});

const Bid = model("Bid", bidSchema);

module.exports = Bid;
