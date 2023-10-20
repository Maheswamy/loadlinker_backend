const uploadFileToS3 = require("../aws/uploadImage");
const User = require("../models/user-model");
const _ = require("lodash");

const ownersCltr = {};

ownersCltr.addVehicle = async (req, res) => {
  try {
    const promises = req.files.map((ele) => uploadFileToS3(ele, "vehicle",req.user.id));
    const uploadedImage = await Promise.all(promises);
    const vehiclePhoto = uploadedImage.reduce((pv, cv) => {
      pv.push(cv.Location);
      return pv;
    }, []);
    res.json({ image: vehiclePhoto });
  } catch (e) {
    res.status(500).json(e);
  }
};

module.exports = ownersCltr;
