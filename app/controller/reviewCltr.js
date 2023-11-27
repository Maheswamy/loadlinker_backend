const Review = require("../models/review-model");
const _ = require("lodash");

const reviewCltr = {};

reviewCltr.create = async (req, res) => {
  const userId = req.user.id;
  const body = _.pick(req.body, ["rating", "feedback", "shipmentId"]);
  body.shipper = userId;
  try {
    const newReview = await new Review(body).save();
    res.json(newReview);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = reviewCltr;
