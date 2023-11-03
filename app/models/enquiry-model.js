const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const enquirySchema = new Schema(
  {
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
          type: Schema.Types.ObjectId,
          ref: "Bid",
        },
      ],
    },
    amount: Number,
    paymentType: {
      type: String,
      enum: ["advance", "after shipment"],
    },
    distance: Number,
    approximateTime: {
      type: String,
    },
    shipperId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

const Enquiry = model("Enquiry", enquirySchema);

module.exports = Enquiry;
