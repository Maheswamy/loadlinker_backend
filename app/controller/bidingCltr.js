const { validationResult } = require("express-validator");
const Enquiry = require("../models/enquiry-model");
const _ = require("lodash");
const Bid = require("../models/bid-model");
const Vehicle = require("../models/vehicle-model");
const { enquiryId } = require("../helper/shipmentValidation");
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

    const responseObj = await Bid.findById(newBid._id).populate({
      path: "vehicleId enquiryId",
      select: "vehicleNumber loadType loadWeight amount",
    });
    res.json(responseObj);
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
  const bidId = req.params.bidId;
  const userId = req.user.id;
  console.log(bidId,'han')
  const errors = validationResult(req);
  console.log(errors);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const deletedBid = await Bid.findOneAndDelete({
      _id: bidId,
      userId: userId,
    });
    console.log(deletedBid)
    const removedBid = await Enquiry.findByIdAndUpdate(
      deletedBid.enquiryId,
      { $pull: { bids: bidId } },
      { new: true }
    );
    // console.log(removedBid)
    res.json(deletedBid);
  } catch (e) {
    res.status(500).json(e);
  }
};

biddingCltr.list = async (req, res) => {
  const enquiryId = req.params.enquiryId;
  const { role, id } = req.user;
  try {
    if (role === "role") {
      const bidsList = await Bid.find(role === "admin").populate({
        path: "vehicleId enquiryId",
        select: "vehicleNumber loadType loadWeight amount",
      });

      // if (bidsList.length == 0) {
      //   return res.status(400).json({ error: "no bids found" });
      // }
      return res.json(bidsList);
    }
    if (role === "owner") {
      const bidsList = await Bid.find({ userId: id }).populate({
        path: "vehicleId enquiryId",
        select: "vehicleNumber loadType loadWeight amount",
      });

      // if (bidsList.length == 0) {
      //   return res.status(400).json({ error: "no bids found" });
      // }
      return res.json(bidsList);
    }
    if (role === "shipper") {
      const bidsList = await Bid.find({ enquiryId: enquiryId }).populate({
        path: "vehicleId enquiryId userId",
        select:
          "vehicleNumber loadType loadWeight amount firstName lastName mobileNumber rating",
      });

      // if (bidsList.length == 0) {
      //   return res.status(400).json({ error: "no bids found" });
      // }
      return res.json(bidsList);
    }
  } catch (e) {
    res.status(500).json(e.message);
  }
};

biddingCltr.singleBid = async (req, res) => {
  const { bidId } = req.params;
  const { role, id } = req.user;
  try {
    const bidsList = await Bid.findOne(
      role === "admin" ? {} : { _id: bidId, userId: id }
    ).populate({
      path: "enquiryId",
      populate: { path: "shipperId", select: "lastName firstName" },
    });

    res.json(bidsList);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

module.exports = biddingCltr;
