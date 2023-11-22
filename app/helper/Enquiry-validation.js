const { isEmpty, isNumeric } = require("validator");
const { notEmptyGenrator } = require("./users-validation");
const isAfter = require("date-fns/isBefore");

const loadType = {
  notEmpty: notEmptyGenrator("load type"),
  isAlpha: {
    errorMessage: "only string is required ",
  },
};

const loadWeight = {
  notEmpty: notEmptyGenrator("load Weight"),
  isNumeric: {
    errorMessage: "please provide proper weigth of load",
    bail: true,
  },
  custom: {
    options: (value) => {
      if (value <= 0) {
        throw new Error("weight should be more than Zero");
      } else {
        return true;
      }
    },
  },
};

const dateOfPickUp = {
  notEmpty: notEmptyGenrator("date of loading"),
  isISO8601: {
    errorMessage: "Invalid Date and Time.",
    bail: true,
  },
  custom: {
    options: (value, { req }) => {
      if (new Date(value) < new Date()) {
        throw new Error("date of Pick Up cannot be less present date ");
      } else {
        return true;
      }
    },
  },
};

const dateOfUnload = {
  notEmpty: notEmptyGenrator("date of Unload"),

  isISO8601: {
    errorMessage: "Invalid Date and Time.",
    bail: true,
  },
  custom: {
    options: (value, { req }) => {
      if (!isAfter(new Date(req.body.dateOfPickUp), new Date(value))) {
        throw new Error("date of unload cannot be less than date of pick Up");
      } else {
        return true;
      }
    },
  },
};

const pickUpLocation = {
  custom: {
    options: async (value) => {
      if (isEmpty(value.address)) {
        throw new Error("address is required");
      } else if (isEmpty(value.area)) {
        throw new Error("area is required");
      } else if (isEmpty(value.district)) {
        throw new Error("district is required");
      } else if (isEmpty(value.state)) {
        throw new Error("state is required");
      } else if (isEmpty(value.country)) {
        throw new Error("country is required");
      } else if (isEmpty(value.pin)) {
        throw new Error("pincode is required");
      } else if (isEmpty(value.lat)) {
        throw new Error("lat is required");
      } else if (isEmpty(value.lng)) {
        throw new Error("lng is required");
      } else {
        return true;
      }
    },
  },
};
const dropOffLocation = {
  custom: {
    options: async (value) => {
      if (isEmpty(value.address)) {
        throw new Error("address is required");
      } else if (isEmpty(value.area)) {
        throw new Error("area is required");
      } else if (isEmpty(value.district)) {
        throw new Error("district is required");
      } else if (isEmpty(value.state)) {
        throw new Error("state is required");
      } else if (isEmpty(value.country)) {
        throw new Error("country is required");
      } else if (isEmpty(value.pin)) {
        throw new Error("pincode is required");
      } else if (isEmpty(value.lat)) {
        throw new Error("lat is required");
      } else if (isEmpty(value.lng)) {
        throw new Error("lng is required");
      } else {
        return true;
      }
    },
  },
};

const enquiryValidation = {
  loadType,
  loadWeight,
  dateOfPickUp,
  dateOfUnload,
  pickUpLocation,
  dropOffLocation,
};

const enquiryCalculationValidation = {
  loadType,
  loadWeight,
  pickUpLocation,
  dropOffLocation,
};

const enquiryIdValidation = {
  enquiryId: {
    in: ["params"],
    isMongoId: {
      errorMessage: "invalid mongoId",
    },
  },
};

module.exports = { enquiryValidation, enquiryCalculationValidation ,enquiryIdValidation};
