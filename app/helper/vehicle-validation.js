const { isEmpty } = require("lodash");
const { isMongoId } = require("validator");
const Vehicle = require("../models/vehicle-model");
const { notEmptyGenerator } = require("./users-validation");

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

const permit = {
  notEmpty: notEmptyGenerator("vehicle Permit"),
  isArray: {
    options: {
      min: 1,
      max: 28,
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
};

const permitLoadCapacity = {
  notEmpty: notEmptyGenerator("maximum load capacity "),
  isNumeric: {
    errorMessage: "invalid format",
  },
  custom: {
    options: (value) => {
      if (value > 49000) {
        throw new Error(
          "Maximum vehicle load capacity in this application is 49,000kg "
        );
      } else {
        return true;
      }
    },
  },
};

const vehicleType = {
  notEmpty: notEmptyGenerator("vehicle type"),
  isMongoId: {
    errorMessage: "invalid maongo id",
  },
};

const vehiclePhoto = {
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
};

const vehicleRegisterValidation = {
  vehicleNumber: {
    notEmpty: notEmptyGenerator("vehicle number "),
    custom: {
      options: (value) => {
        return findVehicleExists(value);
      },
    },
  },
  rcNumber: {
    notEmpty: notEmptyGenerator("vehicle RC number "),
    custom: {
      options: (value) => {
        return findVehicleExists(value);
      },
    },
  },
  permit: permit,
  permittedLoadCapacity: permitLoadCapacity,
  vehicleType: vehicleType,
  vehiclePhoto: vehiclePhoto,
};

const vehicleUpdateValidation = {
  isVerified: {
    isIn: {
      options: [["approved", "reject"]],
    },
    errorMessage: "only approve and reject is allowed",
  },
  reasonForRejection: {
    custom: {
      options: (value, { req }) => {
        if (req.isVerified === "reject") {
          if (isEmpty(value)) {
            throw new Error("reason for rejection is needed");
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
    },
  },
};

module.exports = { vehicleRegisterValidation, vehicleUpdateValidation };
