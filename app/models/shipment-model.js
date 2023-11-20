const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const shipmentSchema = new Schema(
  {
    enquiryId: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    bidId: {
      type: Schema.Types.ObjectId,
      ref: "Bid",
    },
    shipper: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["waiting", "canceled", "loaded", "unloaded"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

const Shipment = model("Shipment", shipmentSchema);

module.exports = Shipment;
