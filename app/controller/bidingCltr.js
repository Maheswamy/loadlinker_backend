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
    body.userId = req.user.id;
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
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const enquiry = await Enquiry.findById(enquiryLoadId);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    const bidIndex = enquiry.bids.findIndex(
      (ele) => ele._id == bidId && ele.userId == req.user.id
    );
    if (bidIndex == -1) {
      return res.status(404).json({ error: "nobid found to update" });
    }
    enquiry.bids[bidIndex].bidAmount = body.bidAmount;
    const updatedEnquiry = await enquiry.save();
    console.log(updatedEnquiry);
    res.json({ message: "BidAmount updated", updatedEnquiry });
  } catch (e) {
    res.status(500).json(e);
  }
};

biddingCltr.remove = async (req, res) => {
  const enquiryLoadId = req.params.enquiryLoadId;
  const bidId = req.params.bidId;
  const userId = req.user.id;
  const errors = validationResult(req);
  console.log(errors)
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const removedBid = await Enquiry.findByIdAndUpdate(
      enquiryLoadId,
      { $pull: { bids: { _id: bidId, userId: userId } } },
      { new: true }
    );
    res.json(removedBid);
  } catch (e) {
    res.status(500).json(e);
  }
};

module.exports = biddingCltr;
