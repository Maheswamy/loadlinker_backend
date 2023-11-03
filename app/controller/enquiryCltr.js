const { validationResult } = require("express-validator");
const Enquiry = require("../models/enquiry-model");
const _ = require("lodash");
const { default: axios } = require("axios");
const {
  addressToCoordinate,
  calculateDistance,
} = require("../helper/addressToCoordinate");

const enquiryCltr = {};

function millisecondsToReadableTime(milliseconds) {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) {
    parts.push(days + (days === 1 ? " day" : " days"));
  }
  if (hours > 0) {
    parts.push(hours + (hours === 1 ? " hour" : " hours"));
  }
  if (minutes > 0) {
    parts.push(minutes + (minutes === 1 ? " minute" : " minutes"));
  }
  if (seconds > 0) {
    parts.push(seconds + (seconds === 1 ? " second" : " seconds"));
  }
  return parts.join(", ");
}

enquiryCltr.create = async (req, res) => {
  const body = _.pick(req.body, [
    "loadType",
    "loadWeight",
    "dateOfPickUp",
    "pickUpLocation",
    "dropLocation",
    "dateOfUnload",
    "paymentType",
    "unloadLocation",
  ]);

  const errors = validationResult(req);
  try {
    // if (!errors.isEmpty()) {
    //   return res.json({ errors: errors.array() });
    // }

    const responePickUpLocation = await addressToCoordinate(
      body.pickUpLocation.address
    );
    const responeunloadLocation = await addressToCoordinate(
      body.unloadLocation.address
    );

    console.log(responePickUpLocation, responePickUpLocation);
    body.pickUpLocation.lat = responePickUpLocation.hits[0].point.lat;
    body.pickUpLocation.lng = responePickUpLocation.hits[0].point.lng;
    body.unloadLocation.lat = responeunloadLocation.hits[0].point.lat;
    body.unloadLocation.lng = responeunloadLocation.hits[0].point.lng;
    const distance = await calculateDistance([
      [body.pickUpLocation.lng, body.pickUpLocation.lat],
      [body.unloadLocation.lng, body.unloadLocation.lat],
    ]);
    body.distance = distance.paths[0].distance / 1000;
    const approximateTime = distance.paths[0].time;
    body.approximateTime = millisecondsToReadableTime(approximateTime);
    body.shipperId = req.user.id;
    const newLoad = await new Enquiry(body).save();

    res.json({ newLoad });
  } catch (e) {
    res.status(500).json(e);
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
  try {
    const allEnquiry = await Enquiry.findById(id);
    res.json(allEnquiry);
  } catch (e) {
    res.status(500).json(e);
  }
};
module.exports = enquiryCltr;


