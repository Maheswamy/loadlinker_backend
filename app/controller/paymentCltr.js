const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const _ = require("lodash");
const Payment = require("../models/payment-model");
const paymentCltr = {};

paymentCltr.create = async (req, res) => {
  console.log(req.body);
  const body = _.pick(req.body, ["amount", "shipmentId"]);
  try {
    //crateing session
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

    //creating new payment data
    const payment = new Payment(body);
    payment.userId = req.user.id;
    payment.method = "card";
    payment.transactionId = session.id;
    await payment.save();
    //responding with url to do payment in front-end
    console.log(session);
    res.json({ id: session.id, url: session.url });
  } catch (e) {
    res.status(400).json(e);
  }
};

paymentCltr.update = async (req, res) => {
  const body = _.pick(req.body, ["transactionId"]);

  try {
    const payment = await Payment.findOneAndUpdate(
      { transactionId: body.transactionId },
      { status: "paid" },
      {
        new: true,
      }
    );
    res.json(payment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = paymentCltr;
