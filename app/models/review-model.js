const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
  shipper: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  shipmentId: {
    type: Schema.Types.ObjectId,
    ref: "shipment",
  },
  rating: Number,
  feedback: String,
});

const Review = model("Review", reviewSchema);

module.exports = Review;
