const { validationResult } = require("express-validator");
const Enquiry = require("../models/enquiry-model");
const _ = require("lodash");
const biddingCltr = {};

// owner bidding his best price to enquiry post of load

biddingCltr.create = async (req, res) => {
  const enquiryLoadId = req.params.enquiryLoadId;
  const body = _.pick(req.body, ["bidAmount", "vehicleId"]);
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const newBid = await Enquiry.findByIdAndUpdate(
      enquiryLoadId,
      { $push: { bids: body } },
      { new: true }
    );
    res.json({ message: "new bid added", newBid });
  } catch (e) {
    res.status(500).json(e);
  }
};

// owner modifying the bid already placed

biddingCltr.update = async (req, res) => {
  const enquiryLoadId = req.params.enquiryLoadId;
  const bidId = req.params.bidId;
  const body = _.pick(req.body, ["bidAmount", "vehicleId"]);
  const errors = validationResult(req);
  try {
    const enquiry = await Enquiry.update(
      { _id: enquiryLoadId, "bids._id": bidId }, // Find the Enquiry document by ID and the bid's index.
      { $set: { "bids.$.bidAmount": body.bidAmount } }
    );
    res.json(enquiry);
  } catch (e) {
    res.status(500).json(e);
  }
};

module.exports = biddingCltr;
