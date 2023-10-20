const uploadFileToS3 = require("../aws/uploadImage");
const User = require("../models/user-model");
const _ = require("lodash");

const ownersCltr = {};

ownersCltr.addVehicle = async (req, res) => {
  try {
    const promises = req.files.map((ele) => uploadFileToS3(ele));
    const uploadedFiles = await Promise.all(promises);
    res.json({ image: uploadedFiles });
  } catch (e) {
    res.status(500).json(e);
  }
};

module.exports = ownersCltr;
