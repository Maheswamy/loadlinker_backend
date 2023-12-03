const Review = require("../models/review-model");
const _ = require("lodash");
const Shipment = require("../models/shipment-model");

const reviewCltr = {};

reviewCltr.create = async (req, res) => {
  const userId = req.user.id;
  const body = _.pick(req.body, ["rating", "feedback", "shipmentId"]);
  body.shipper = userId;
  try {
    const newReview = await new Review(body).save();
    const updatedShipment = await Shipment.findByIdAndUpdate(
      newReview.shipmentId,
      {
        review: newReview._id,
      },
      { new: true }
    )
      .populate("enquiryId payment review")
      .populate({
        path: "bidId",
        populate: {
          path: "vehicleId", // Specify the nested field using dot notation
          select: "vehicleNumber",
        },
      });
    res.json(updatedShipment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = reviewCltr;
