const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const enquirySchema = new Schema(
  {
    loadType: String,
    loadWeight: Number,
    dateOfPickUp: Date,
    pickUpLocation: {
      type: {
        address: String,
        area: String,
        district: String,
        state: String,
        country: String,
        pin: String,
        lat: String,
        lng: String,
      },
    },
    dateOfUnload: Date,
    dropUpLocation: {
      type: {
        address: String,
        area: String,
        district: String,
        state: String,
        country: String,
        pin: String,
      },
    },
    coordinates: {
      type: { pickUpCoordinate: [], dropCoordinate: [] },
    },
    bids: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Bid",
        },
      ],
    },
    amount: String,
    paymentType: {
      type: String,
      enum: ["advance", "after shipment"],
    },
    distance: Number,
    approximateTime: {
      type: Number,
    },
    shipperId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    delete: {
      type: Boolean,
      default: false,
    },
    vehicleType: {
      type: Schema.Types.ObjectId,
      ref: "VehicleType",
    },
  },

  { timestamps: true }
);

const Enquiry = model("Enquiry", enquirySchema);

module.exports = Enquiry;
