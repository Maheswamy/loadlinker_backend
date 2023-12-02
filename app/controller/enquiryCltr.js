const { validationResult } = require("express-validator");
const Enquiry = require("../models/enquiry-model");
const _ = require("lodash");
const {
  addressPicker,
  calculateDistance,
} = require("../helper/addressToCoordinate");
const VehicleType = require("../models/vehicleType-model");

const enquiryCltr = {};

// function which split the error array into object and its property
const errorFormatter = (ele) => {
  const [obj, prop] = ele.path.split(".");
  return { obj, prop };
};

// calculate the amount for enquiry
enquiryCltr.calculate = async (req, res) => {
  const body = _.pick(req.body, [
    "loadType",
    "loadWeight",
    "pickUpLocation",
    "dropOffLocation",
  ]);
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      // creating the error object
      const formatedError = errors.array().reduce(
        (pv, cv) => {
          if (cv.path.includes(".")) {
            const { obj, prop } = errorFormatter(cv);

            pv[`${obj}`][`${prop}`] = cv.msg;
          } else {
            pv[cv.path] = cv.msg;
          }
          return pv;
        },
        { pickUpLocation: {}, dropOffLocation: {} }
      );

      return res.status(400).json({ errors: formatedError });
    }

    const pickUpCoordinate = await addressPicker(body.pickUpLocation);
    const dropCoordinate = await addressPicker(body.dropOffLocation);

    const distanceAndDuration = await calculateDistance([
      pickUpCoordinate,
      dropCoordinate,
    ]);
    if (body.pickUpLocation.lat == 0 || body.dropOffLocation.lat == 0) {
      [body.pickUpLocation.lng, body.pickUpLocation.lat] = pickUpCoordinate;
      [body.dropOffLocation.lng, body.dropOffLocation.lat] = dropCoordinate;
    }
    const vehicle = await VehicleType.findOne({
      $and: [
        { minimumWeight: { $lte: body.loadWeight } },
        { maximumWeight: { $gte: body.loadWeight } },
      ],
    });
    body.vehicleTypeId = vehicle._id;
    const shippingAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(vehicle.pricePerKiloMeter * distanceAndDuration.distance);

    body.amount = shippingAmount.slice(0, -3);
    body.distance = distanceAndDuration;
    res.json(body);
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
    "dropOffLocation",
    "dateOfUnload",
    "unloadLocation",
  ]);
  console.log(body);
  const errors = validationResult(req);
  try {
    const formatedError = errors.array().reduce(
      (pv, cv) => {
        if (cv.path.includes(".")) {
          const { obj, prop } = errorFormatter(cv);

          pv[`${obj}`][`${prop}`] = cv.msg;
        } else {
          pv[cv.path] = cv.msg;
        }
        return pv;
      },
      { pickUpLocation: {}, dropOffLocation: {} }
    );
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: formatedError });
    }

    const pickUpCoordinate = await addressPicker(body.pickUpLocation);
    const dropCoordinate = await addressPicker(body.dropOffLocation);
    const distanceAndDuration = await calculateDistance([
      pickUpCoordinate,
      dropCoordinate,
    ]);
    body.coordinates = {
      pickUpCoordinate: pickUpCoordinate.reverse(),
      dropCoordinate: dropCoordinate.reverse(),
    };
    const vehicle = await VehicleType.findOne({
      $and: [
        { minimumWeight: { $lte: body.loadWeight } },
        { maximumWeight: { $gte: body.loadWeight } },
      ],
    });
    body.vehicleType = vehicle._id;

    body.shipperId = req.user.id;
    body.amount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(
      Math.round(vehicle.pricePerKiloMeter * distanceAndDuration.distance)
    );

    body.distance = distanceAndDuration.distance;
    body.dateOfPickUp = new Date(body.dateOfPickUp);
    body.dateOfUnload = new Date(body.dateOfUnload);
    
    const newLoad = await new Enquiry(body).save();

    res.json(newLoad);
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
    console.log(enquiryId);
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
    res.json(removedEnquiry);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

enquiryCltr.myEnquiries = async (req, res) => {
  const role = req.user.role;
  try {
    const enquires = await Enquiry.find(
      role === "admin" ? null : { shipperId: req.user.id, delete: false }
    );
    if (!enquires) {
      return res.status(404).json({ error: "no enquiries found" });
    }
    res.json(enquires);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

enquiryCltr.allEnquiry = async (req, res) => {
  const { source, destination, loadWeight, skip } = req.query;
  try {
    let allEnquiry = [];
    if ((source != "" || destination != "") && loadWeight !== "") {
      allEnquiry = await Enquiry.find({
        dateOfPickUp: { $gte: new Date() },
        "pickUpLocation.district": { $regex: source, $options: "i" },
        "dropOffLocation.district": { $regex: destination, $options: "i" },
        vehicleType: loadWeight,
        delete: false,
      })
        .skip(+skip)
        .limit(10);
    } else if (source != "" || destination != "") {
      allEnquiry = await Enquiry.find({
        dateOfPickUp: { $gte: new Date().toISOString() },
        "pickUpLocation.district": { $regex: source, $options: "i" },
        "dropOffLocation.district": { $regex: destination, $options: "i" },

        delete: false,
      })
        .skip(+skip)
        .limit(10);
    } else if (loadWeight !== "") {
      allEnquiry = await Enquiry.find({
        dateOfPickUp: { $gte: new Date() },

        vehicleType: loadWeight,
        delete: false,
      })
        .skip(+skip)
        .limit(10);
    } else {
      allEnquiry = await Enquiry.find({
        dateOfPickUp: { $gte: new Date() },
        delete: false,
      })
        .skip(+skip)
        .limit(10);
    }
    console.log(allEnquiry);
    const sanitizeEnquiry = allEnquiry.map((ele) =>
      _.pick(ele, [
        "_id",
        "loadType",
        "loadWeight",
        "coordinates",
        "pickUpLocation.district",
        "dropOffLocation.district",
        "amount",
        "paymentType",
      ])
    );
    res.json(sanitizeEnquiry);
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

enquiryCltr.count = async (req, res) => {
  try {
    const allEnquiry = await Enquiry.find({
      dateOfPickUp: { $gte: new Date() },
      delete: false,
    }).count();
    res.json(allEnquiry);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
module.exports = enquiryCltr;
