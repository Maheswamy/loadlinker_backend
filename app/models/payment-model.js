const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const paymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: Number,
    method: String,
    transactionId: String,
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "paid"],
    },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
    },
  },
  { timestamps: true }
);
const Payment = model("Payment", paymentSchema);

module.exports = Payment;
