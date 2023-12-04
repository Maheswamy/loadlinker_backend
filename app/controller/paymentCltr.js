const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const _ = require("lodash");
const Payment = require("../models/payment-model");
const Shipment = require("../models/shipment-model");
const paymentCltr = {};

paymentCltr.create = async (req, res) => {
  console.log(req.body);
  const body = _.pick(req.body, ["amount", "shipmentId"]);
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Shipment Fee",
            },
            unit_amount: req.body.amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/shipment/${body.shipmentId}?payment=success`,
      cancel_url: `http://localhost:3000/shipment/${body.shipmentId}?payment=cancel`,
    });

    const payment = new Payment(body);
    payment.userId = req.user.id;
    payment.method = "card";
    payment.transactionId = session.id;
    await payment.save();
    
    
    console.log(session);
    res.json({ id: session.id, url: session.url });
  } catch (e) {
    res.status(400).json(e);
  }
};

paymentCltr.update = async (req, res) => {
  const body = _.pick(req.body, ["shipmentId", "transactionId"]);

  try {
    const payment = await Payment.findOneAndUpdate(
      { transactionId: body.transactionId },
      { status: "paid" },
      {
        new: true,
      }
    );

    const updateShipment = await Shipment.findByIdAndUpdate(
      body.shipmentId,
      { payment: payment._id },
      {
        new: true,
      }
    )
      .populate("enquiryId payment")
      .populate({
        path: "bidId",
        populate: {
          path: "vehicleId", // Specify the nested field using dot notation
          select: "vehicleNumber",
        },
      });
    res.json(updateShipment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = paymentCltr;
