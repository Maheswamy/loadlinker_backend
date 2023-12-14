const { notEmptyGenerator } = require("./users-validation");

const loadType = {
  notEmpty: notEmptyGenerator("load type"),
  isAlpha: {
    errorMessage: "only string is required ",
  },
};

const loadWeight = {
  notEmpty: notEmptyGenerator("load Weight"),
  isAlphanumeric: {
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
  notEmpty: notEmptyGenerator("date of loading"),
  isDate: {
    options: {
      format: "MM/DD/YYYY",
    },
    errorMessage: "Invalid Date and Time.",
    bail: true,
  },
  custom: {
    options: (value, { req }) => {
      if (
        new Date(value).toLocaleDateString() < new Date().toLocaleDateString()
      ) {
        throw new Error("date of Pick Up cannot be less present date ");
      } else {
        return true;
      }
    },
  },
};

const dateOfUnload = {
  notEmpty: notEmptyGenerator("date of Unload"),

  isDate: {
    options: {
      format: "MM/DD/YYYY",
    },
    errorMessage: "Invalid Date and Time.",
    bail: true,
  },
  custom: {
    options: (value, { req }) => {
      if (
        new Date(value).toLocaleDateString() <
        new Date(req.body.dateOfPickUp).toLocaleDateString()
      ) {
        throw new Error("date of unload cannot be less than date of pick Up");
      } else {
        return true;
      }
    },
  },
};

const addressValidator = (filedName) => {
  return {
    notEmpty: notEmptyGenerator(filedName),
  };
};

const generateAddressValidator = (fieldName) => {
  return {
    notEmpty: notEmptyGenerator(fieldName),
  };
};

const generateLocationValidation = (locationPrefix) => {
  const locationFields = [
    "address",
    "state",
    "country",
    "pin",
    "area",
    "lat",
    "lng",
  ];

  const locationValidation = {};
  locationFields.forEach((field) => {
    locationValidation[`${locationPrefix}.${field}`] =
      generateAddressValidator(field);
  });

  return locationValidation;
};

const enquiryValidation = {
  loadType,
  loadWeight,
  dateOfPickUp,
  dateOfUnload,
  ...generateLocationValidation("pickUpLocation"),
  ...generateLocationValidation("dropOffLocation"),
};

const enquiryCalculationValidation = {
  loadType,
  loadWeight,
  ...generateLocationValidation("pickUpLocation"),
  ...generateLocationValidation("dropOffLocation"),
};

const enquiryIdValidation = {
  enquiryId: {
    in: ["params"],
    isMongoId: {
      errorMessage: "invalid mongoId",
    },
  },
};

module.exports = {
  enquiryValidation,
  enquiryCalculationValidation,
  enquiryIdValidation,
};
