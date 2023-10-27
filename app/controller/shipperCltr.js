const { validationResult } = require("express-validator");
const Enquiry = require("../models/enquiry-model");
const _ = require("lodash");
const { default: axios } = require("axios");
const {
  addressToCoordinate,
  calculateDistance,
} = require("../helper/addressToCoordinate");

const shipperCltr = {};

shipperCltr.create = async (req, res) => {
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
    console.log(distance.paths[0].distance / 1000);
    const newLoad = await new Enquiry(body).save();

    res.json({ newLoad, distance: distance.paths[0].distance / 1000 });
  } catch (e) {
    res.status(500).json(e);
  }
};

module.exports = shipperCltr;
