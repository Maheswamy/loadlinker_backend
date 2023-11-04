const uploadFileToS3 = require("../aws/uploadImage");
const User = require("../models/user-model");
const _ = require("lodash");
const VehicleType = require("../models/vehicleType-model");
const { validationResult } = require("express-validator");
const Vehicle = require("../models/vehicle-model");
const Enquiry = require("../models/enquiry-model");
const Permit = require("../models/permit-model");

const vehicleCltr = {};

// function that pick only required fileds array of objectss
const requiredPick = (value, fields) => {
  return value.map((ele) => _.pick(ele, fields));
};

//add vehicle
vehicleCltr.addVehicle = async (req, res) => {
  const body = _.pick(req.body, [
    "vehicleNumber",
    "rcNumber",
    "permittedLoadCapacity",
    "vehicalType",
    "permit",
  ]);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rc, vehicleImage } = req.files;
    const arrayBuffer = [...rc, ...vehicleImage];
    const allResolved = await Promise.all(
      arrayBuffer.map((ele) => uploadFileToS3(ele, ele.fieldname, req.user.id))
    );
    const splitImage = allResolved.reduce(
      (pv, cv) => {
        if (cv.Location.includes("vehicleImage")) {
          pv.vehicleImages.push({ url: cv.Location, key: cv.Key });
        } else {
          pv.rcImages.push({ url: cv.Location, key: cv.Key });
        }
        return pv;
      },
      { rcImages: [], vehicleImages: [] }
    );

    (body.rcImages = splitImage.rcImages),
      (body.vehicleImages = splitImage.vehicleImages);
    body.ownerId = req.user.id;
    const newVehicle = await new Vehicle(body).save();
    await User.findByIdAndUpdate(req.user.id, {
      $push: { vehicles: newVehicle._id },
    });
    res.json(newVehicle);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

//vehicle list
vehicleCltr.list = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const list = await Vehicle.find(
      role === "admin" ? null : { ownerId: userId }
    );
    if (list.length == 0) {
      return res.status(404).json({ error: "no vehicles found" });
    }
    const response = requiredPick(list, [
      "_id",
      "rcNumber",
      "vehicleNumber",
      "isVerified",
    ]);
    res.json(response);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

// single vehicle details

vehicleCltr.singleVehicle = async (req, res) => {
  const vehicleId = req.params.vehicleId;
  const userId = req.user.id;
  const role = req.user.role;
  try {
    const vehicle = await Vehicle.findOne(
      role === "owner"
        ? { ownerId: userId, _id: vehicleId }
        : { _id: vehicleId }
    );
    if (!vehicle) {
      return res.status(404).json({ error: "vehicle not found" });
    }
    res.json(vehicle);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

//vehicle details update

vehicleCltr.update = async (req, res) => {
  try {
    res.json("hitted");
  } catch (e) {
    res.status(500).json(e.message);
  }
};

// Vehicle type  section

vehicleCltr.addVehicleType = async (req, res) => {
  const body = _.pick(req.body, [
    "maximumWeight",
    "name",
    "code",
    "pricePerKiloMeter",
    "range",
    "type",
  ]);
  try {
    const newTypeVehicle = await new VehicleType(body).save();
    res.json({
      message: "new type of vehicle added to database",
      data: newTypeVehicle,
    });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

vehicleCltr.vehicleTypeList = async (req, res) => {
  try {
    const list = await VehicleType.find();
    res.json(list);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

vehicleCltr.addPermit = async (req, res) => {
  const body = _.pick(req.body, ["state"]);
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const newPermit = await new Permit(body).save();
    res.json({ message: `permit of ${newPermit.state} is created ` });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

module.exports = vehicleCltr;
