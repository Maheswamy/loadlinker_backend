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

module.exports = shipmentCltr;
