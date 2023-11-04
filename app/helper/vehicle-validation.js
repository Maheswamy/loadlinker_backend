const { isEmpty } = require("lodash");
const { isMongoId } = require("validator");
const Vehicle = require("../models/vehicle-model");
const { notEmptyGenrator } = require("./users-validation");

const findVehicleExists = async (value) => {
  const vehicle = await Vehicle.findOne({
    $or: [{ vehicleNumber: value }, { rcNumber: value }],
  });
  if (vehicle) {
    throw new Error("vehicle  already exists");
  } else {
    return true;
  }
};

const vehicleSchemaValidation = {
  vehicleNumber: {
    notEmpty: notEmptyGenrator("vehicle number "),
    custom: {
      options: (value) => {
        return findVehicleExists(value);
      },
    },
  },
  rcNumber: {
    notEmpty: notEmptyGenrator("vehicle RC number "),
    custom: {
      options: (value) => {
        return findVehicleExists(value);
      },
    },
  },
  permit: {
    notEmpty: notEmptyGenrator("vehicle Permit"),
    isArray: {
      options: {
        min: 1,
        max: 27,
      },
      errorMessage: "min one permitt is required",
      bail: true,
    },
    custom: {
      options: (value) => {
        const result = value.every((ele) => isMongoId(ele));
        if (result) {
          return true;
        } else {
          throw new Error("array should only consist valid MongoID");
        }
      },
    },
  },

  permittedLoadCapacity: {
    notEmpty: notEmptyGenrator("maximum load capacity "),
    isNumeric: {
      errorMessage: "invalid format",
    },
  },
  vehicleType: {
    notEmpty: notEmptyGenrator("vehicle type"),
    isMongoId: {
      errorMessage: "invalid maongo id",
    },
  },
  vehiclePhoto: {
    custom: {
      options: (value, { req }) => {
        if (isEmpty(req.files)) {
          throw new Error("no images found");
        }
        if (isEmpty(req.files.rc)) {
          throw new Error("no rc images found");
        }
        if (req.files.rc.length > 2) {
          throw new Error("only front and back image of RC is required");
        }

        if (isEmpty(req.files.vehicleImage)) {
          throw new Error("vehicle images not found");
        }
        if (req.files.rc.length > 5) {
          throw new Error("only five images of vehicle is enough");
        } else {
          return true;
        }
      },
    },
  },
};

module.exports = { vehicleSchemaValidation };
