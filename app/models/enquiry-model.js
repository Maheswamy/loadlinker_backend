const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const enquirySchema = new Schema({
  loadtype: String,
  loadWeight: Number,
  dateOfPickUp: Date,
  pickUpLocation: {
    address: String,
    lat: String,
    lng: String,
  },
  dateOfUnload: Date,
  unloadLocation: {
    address: String,
    lat: String,
    lng: String,
  },
  bids: {
    type: [
      {
        vehicleId: {
          type: Schema.Types.ObjectId,
          ref: "Vehicle",
        },
        bidAmount: Number,
      },
    ],
  },
  amount: Number,
  paymentType: {
    type: String,
    enum: ["advance", "after shipment"],
  },
  distance: Number,
  shipperId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Enquiry = model("Enquiry", enquirySchema);

module.exports = Enquiry;
