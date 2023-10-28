const { isEmpty } = require("lodash");
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
        console.log(typeof req.files);
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
