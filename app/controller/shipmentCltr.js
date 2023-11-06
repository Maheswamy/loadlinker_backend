const _ = require("lodash");
const Enquiry = require("../models/enquiry-model");
const Vehicle = require("../models/vehicle-model");
const Shipment = require("../models/shipment-model");
const { validationResult } = require("express-validator");

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
    const addShipment = await new Shipment(body).save();
    const softDeleteEnquiry = await Enquiry.findByIdAndUpdate(
      addShipment.enquiryId,
      { delete: true }
    );
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
    const shipments = await Shipment.find(
      role == "admin" ? null : { userId: id }
    );
    if (shipments.length == 0) {
      return res.status(404).json({ error: "no shipment found" });
    }
    res.json(shipments);
  } catch (e) {
    res.json(e.message);
  }
};

shipmentCltr.singleShipment = async (req, res) => {
  const { shipmentId } = -req.params;
  const { id, role } = req.user;
  try {
    const shipment = await Shipment.findOne({
      _id: shipmentId,
      userId: role === "admin" ? null : id,
    });
    if (!shipment) {
      return res.status(400).json({ error: "no shipment found" });
    }
    res.json(shipment);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

module.exports = shipmentCltr;
