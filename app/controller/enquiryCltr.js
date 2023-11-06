const { validationResult } = require("express-validator");
const Enquiry = require("../models/enquiry-model");
const _ = require("lodash");
const {
  addressPicker,
  calculateDistance,
} = require("../helper/addressToCoordinate");
const VehicleType = require("../models/vehicleType-model");

const enquiryCltr = {};

// calculate the amount for enquiry
enquiryCltr.calculate = async (req, res) => {
  
  const body = _.pick(req.body, [
    "loadType",
    "loadWeight",
    "pickUpLocation",
    "dropUpLocation",
  ]);
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pickUpCoordinate = await addressPicker(body.pickUpLocation);
    const dropCoordinate = await addressPicker(body.dropUpLocation);
    const distanceAndDuration = await calculateDistance([
      pickUpCoordinate,
      dropCoordinate,
    ]);
    const vehicle = await VehicleType.findOne({
      $and: [
        { minimumWeight: { $lte: body.loadWeight } },
        { maximumWeight: { $gte: body.loadWeight } },
      ],
    });
    const shippingAmount =
      vehicle.pricePerKiloMeter * distanceAndDuration.distance;
    
    res.json({
      pickUpCoordinate,
      dropCoordinate,
      distanceAndDuration,
      shippingAmount,
    });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

// controller to create the Enquiry
enquiryCltr.create = async (req, res) => {
  const body = _.pick(req.body, [
    "loadType",
    "loadWeight",
    "dateOfPickUp",
    "pickUpLocation",
    "dropUpLocation",
    "dateOfUnload",
    "paymentType",
    "unloadLocation",
  ]);

  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const pickUpCoordinate = await addressPicker(body.pickUpLocation);
    const dropCoordinate = await addressPicker(body.dropUpLocation);
    console.log(pickUpCoordinate, dropCoordinate);
    body.coordinates = { pickUpCoordinate, dropCoordinate };

    const distanceAndDuration = await calculateDistance([
      pickUpCoordinate,
      dropCoordinate,
    ]);
    console.log(distanceAndDuration, "amsajhdgasgdjh");
    const vehicle = await VehicleType.findOne({
      $and: [
        { minimumWeight: { $lte: body.loadWeight } },
        { maximumWeight: { $gte: body.loadWeight } },
      ],
    });
    body.vehicleType = vehicle._id;
    const shippingAmount =
      vehicle.pricePerKiloMeter * distanceAndDuration.distance;
    body.shipperId = req.user.id;
    body.amount = shippingAmount;
    (body.distance = distanceAndDuration.distance),
      (body.duration = distanceAndDuration.time);
    const newLoad = await new Enquiry(body).save();

    res.json({ newLoad });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

enquiryCltr.remove = async (req, res) => {
  const enquiryId = req.params.enquiryId;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const removedEnquiry = await Enquiry.findOneAndDelete(
      req.user.role === "shipper"
        ? {
            _id: enquiryId,
            shipperId: req.user.id,
          }
        : { _id: enquiryId }
    );
    if (!removedEnquiry) {
      return res.status(404).json({ error: "no enquiry found" });
    }
    res.json({
      message: "successfully enquiry deleted",
      _id: removedEnquiry._id,
    });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

enquiryCltr.myEnquiries = async (req, res) => {
  try {
    const enquires = await Enquiry.find({ shipperId: req.user.id });
    if (!enquires) {
      return res.json({ error: "not enquiries found" });
    }
    res.json(enquires);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

enquiryCltr.allEnquiry = async (req, res) => {
  try {
    const allEnquiry = await Enquiry.find();
    res.json(allEnquiry);
  } catch (e) {
    res.status(500).json(e);
  }
};
enquiryCltr.singleEnquiry = async (req, res) => {
  const id = req.params.enquiryId;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const allEnquiry = await Enquiry.findById(id);
    res.json(allEnquiry);
  } catch (e) {
    res.status(500).json(e.message);
  }
};
module.exports = enquiryCltr;
