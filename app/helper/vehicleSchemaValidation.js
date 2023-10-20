const Vehicle = require("../models/vehicle-model");

const vehicleSchemaValidation = {
  vehicleNumber: {
    notEmpty: {
      errorMessage: "please enter the Vehicle number",
    },
    custom: {
      options: async (value) => {
        const vehicle = await Vehicle.findOne({ vehicleNumber: value });
        if (!vehicle) {
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
    },
    custom: {
      options: async (value) => {
        const vehicle = await Vehicle.findOne({ rcNumber: value });
        if (!vehicle) {
          throw new Error("vehicle  already exists");
        } else {
          return true;
        }
      },
    },
  },
};

module.exports = { vehicleSchemaValidation };
