const Vehicle = require("../models/vehicle-model");

const vehicleSchemaValidation = {
  vehicleNumber: {
    notEmpty: {
      errorMessage: "please enter the Vehicle number",
      bail: true,
    },
    custom: {
      options: async (value) => {
        const vehicle = await Vehicle.findOne({ vehicleNumber: value });
        if (vehicle) {
          throw new Error("vehicle already exists");
        } else {
          return true;
        }
      },
    },
  },
  rcNumber: {
    notEmpty: {
      errorMessage: "please enter the Vehicle Registration Certificate number",
      bail: true,
    },
    custom: {
      options: async (value) => {
        const vehicle = await Vehicle.findOne({ rcNumber: value });
        if (vehicle) {
          throw new Error("vehicle  already exists");
        } else {
          return true;
        }
      },
    },
  },
  permittedLoadCapacity: {
    notEmpty: {
      errorMessage: "maximum load capacity of vehicle needed",
      bail: true,
    },
    isNumeric: {
      errorMessage: "invalid format",
    },
  },
  vehicalType: {
    notEmpty: {
      errorMessage: "vehicle type is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid maongo id",
    },
  },
  vehiclePhoto: {
    custom: {
      options: (value, { req }) => {
        if (req.files.rc.length == 0 || req.files.rc.length > 2) {
          throw new Error(
            "front and back image of RC of vehicle only required"
          );
        } else if (
          req.files.vehicleImage.length == 0 ||
          req.files.vehicleImage.length > 5
        ) {
          throw new Error("maximum of 5 images of vehicle is enough ");
        } else {
          return true;
        }
      },
    },
  },
};

module.exports = { vehicleSchemaValidation };
