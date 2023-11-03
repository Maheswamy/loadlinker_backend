const { validationResult } = require("express-validator");
const Enquiry = require("../models/enquiry-model");
const _ = require("lodash");
const Bid = require("../models/bid-model");
const Vehicle = require("../models/vehicle-model");
const biddingCltr = {};

// owner bidding his best price to enquiry post of load

biddingCltr.create = async (req, res) => {
  const body = _.pick(req.body, ["bidAmount", "vehicleId", "enquiryId"]);
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    body.userId = req.user.id;
    const vehicleApprove = await Vehicle.findById(body.vehicleId);
    if (!vehicleApprove.isVerified) {
      return res.status(401).json({ message: "vehicle not approved" });
    }
    const newBid = await new Bid(body).save();
    const addBid = await Enquiry.findByIdAndUpdate(
      newBid.enquiryId,
      {
        $push: { bids: newBid._id },
      },
      { new: true }
    );
    res.json({ message: "new bid added", newBid });
  } catch (e) {
    res.status(500).json(e);
  }
};

// owner modifying the bid already placed

biddingCltr.update = async (req, res) => {
  const bidId = req.params.bidId;
  const body = _.pick(req.body, ["bidAmount"]);
  const userId = req.user.id;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(bidId);
    const updatedBid = await Bid.findOneAndUpdate(
      { _id: bidId, userId: userId },
      body,
      { new: true }
    );

    if (!updatedBid) {
      return res
        .status(404)
        .json({ message: "you have not bid for this enquiry" });
    }
    res.json(updatedBid);
  } catch (e) {
    res.status(500).json(e);
  }
};

biddingCltr.remove = async (req, res) => {
  const enquiryLoadId = req.params.enquiryLoadId;
  const bidId = req.params.bidId;
  const userId = req.user.id;
  const errors = validationResult(req);
  console.log(errors);
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
