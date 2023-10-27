const { isEmpty, isNumeric } = require("validator");

const loadType = {
  notEmpty: {
    errorMessage: `load type is required`,
    bail: true,
  },
  isAlpha: {
    errorMessage: "only string is required ",
  },
};

const loadWeight = {
  notEmpty: {
    errorMessage: `load weight is required`,
    bail: true,
  },
  isNumeric: {
    errorMessage: "please provide proper weigth of load",
  },
};

const dateOfPickUp = {
  notEmpty: {
    errorMessage: `date of load is required `,
    bail: true,
  },
  isDate: {
    errorMessage: "please provide the date in YYYY/MM/DD",
  },
  custom: {
    options: (value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Date of pickup must be in the future");
      }
      return true;
    },
  },
};

const dateOfUnload = {
  notEmpty: {
    errorMessage: `date of unload  is required`,
    bail: true,
  },
  isDate: {
    errorMessage: "please provide the date in YYYY/MM/DD",
  },
  custom: {
    options: (value, { req }) => {
      const dateOfPickup = req.body.dateOfPickup;
      if (new Date(value) <= new Date(dateOfPickup)) {
        throw new Error(
          "Date of unload must be greater than the date of pickup"
        );
      }
      return true;
    },
  },
};

const pickUpLocation = {
  custom: {
    options: async (value) => {
      console.log(value);
      if (isEmpty(value.address)) {
        throw new Error("address is required");
      } else if (isEmpty(value.lat)) {
        throw new Error("lat is required");
      } else if (isEmpty(value.lag)) {
        throw new Error("lng is required");
      } else {
        return true;
      }
    },
  },
};
const unloadLocation = {
    custom: {
      options: async (value) => {
        console.log(value);
        if (isEmpty(value.address)) {
          throw new Error("address is required");
        } else if (isEmpty(value.lat)) {
          throw new Error("lat is required");
        } else if (isEmpty(value.lag)) {
          throw new Error("lng is required");
        } else {
          return true;
        }
      },
    },
  };

const addLoadValidation = {
  loadType,
  loadWeight,
  dateOfPickUp,
  dateOfUnload,
  pickUpLocation,
  unloadLocation
};

module.exports = addLoadValidation;
