const _ = require("lodash");
const Enquiry = require("../models/enquiry-model");
const Vehicle = require("../models/vehicle-model");
const Shipment = require("../models/shipment-model");
const { validationResult } = require("express-validator");
const Bid = require("../models/bid-model");

const shipmentCltr = {};

shipmentCltr.approve = async (req, res) => {
  const enquiryId = req.params.enquiryId;
  const body = _.pick(req.body, ["bidId"]);

  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    body.enquiryId = enquiryId;
    body.userId = req.user.id;
    const addShipment = await new Shipment(body).save();
    const softDeleteEnquiry = await Enquiry.findByIdAndUpdate(
      addShipment.enquiryId,
      { delete: true }
    );
    await Bid.updateMany(
      { enquiryId: enquiryId },
      { $set: { status: "rejected" } }
    );
    await Bid.findByIdAndUpdate(addShipment.bidId, { status: "approved" });

    const shipmentDetail = await Shipment.findById(addShipment._id).populate(
      "bidId enquiryId"
    );

    res.json(shipmentDetail);
  } catch (e) {
    res.status(500).json(e);
  }
};

shipmentCltr.list = async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === "admin") {
      const shipments = await Shipment.find().populate([
        "enquiryId",
        "bidId",
        "userId",
        "payment",
      ]);

      return res.json(shipments);
    }
    if (role === "shipper") {
      const shipments = await Shipment.find({ userId: id })
        .populate("enquiryId userId payment")
        .populate({
          path: "bidId",
          populate: {
            path: "vehicleId", // Specify the nested field using dot notation
            select: "vehicleNumber",
          },
        });
      return res.json(shipments);
    }
    // if (role === "owner") {
    //   const shipments = await Shipment.find(
    //     role == "admin" ? null : { userId: id }
    //   ).populate(["enquiryId", "bidId", "userId", "payment"]);
    //
    //   return res.json(shipments);
    // }
  } catch (e) {
    res.status(500).json(e.message);
  }
};

shipmentCltr.singleShipment = async (req, res) => {
  const { shipmentId } = -req.params;
  const { id, role } = req.user;
  try {
    const shipment = await Shipment.findOne({
      _id: shipmentId,
      userId: role === "admin" ? null : id,
    }).populate(["enquiryId", "bidId", "userId", "payment"]);
    if (!shipment) {
      return res.status(400).json({ error: "no shipment found" });
    }
    res.json(shipment);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

module.exports = shipmentCltr;
