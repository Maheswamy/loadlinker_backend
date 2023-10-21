const uploadFileToS3 = require("../aws/uploadImage");
const User = require("../models/user-model");
const _ = require("lodash");
const VehicleType = require("../models/vehicleType-model");
const { validationResult } = require("express-validator");

const ownersCltr = {};

// ownersCltr.addVehicle = async (req, res) => {
//   try {
//     const promises = req.files.map((ele) => uploadFileToS3(ele, "vehicle"));
//     const uploadedImage = await Promise.all(promises);
//     const vehiclePhoto = uploadedImage.reduce((pv, cv) => {
//       pv.push(cv.Location);
//       return pv;
//     }, []);
//     res.json({ image: vehiclePhoto });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json(e);
//   }
// };

ownersCltr.addVehicle = async (req, res) => {
  const body = _.pick(req.body, [
    "vehicleNumber",
    "rcNumber",
    "permittedLoadCapacity",
    "vehicalType",
  ]);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.json({body})
  } catch (e) {
    res.status(500).json(e);
  }
};

ownersCltr.addVehicleType = async (req, res) => {
  const body = _.pick(req.body, ["maximumWeight", "name", "code"]);
  try {
    const newTypeVehicle = await new VehicleType(body).save();
    res.json({
      message: "new type of vehicle added to database",
      data: newTypeVehicle,
    });
  } catch (e) {
    res.status(500).json(e);
  }
};

ownersCltr.vehicleTypeList = async (req, res) => {
  try {
    const list = await VehicleType.find();
    res.json(list);
  } catch (e) {
    res.status(500).json(e);
  }
};

module.exports = ownersCltr;
