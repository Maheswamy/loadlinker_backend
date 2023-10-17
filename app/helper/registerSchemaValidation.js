const User = require("../models/user-model");

const firstName = {
  notEmpty: {
    errorMessage: "Please enter the First Name",
  },
};

const password = {
  notEmpty: {
    errorMessage: "password can be empty",
  },
  isLength: {
    options: {
      min: 8,
    },
    errorMessage: "password should be with in 8 to 128 character",
  },
  isStrongPassword: {
    options: {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    errorMessage:
      "password should contain minimum one lowercase , one uppercase, one Number and one Symsbol",
  },
};

const email = {
  notEmpty: {
    errorMessage: "email cannot be empty",
  },
  isEmail: {
    errorMessage: "invalid email id",
  },
  custom: {
    options: async (value, { req, res }) => {
      try {
        const user = await User.findOne({ email: value });
        if (!user) {
          return true;
        } else {
          throw new Error("email already exists");
        }
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};

const mobileNumber = {
  notEmpty: {
    errorMessage: "mobile number cannot be empty",
  },
  isAlphanumeric: {
    errorMessage: "please enter only digits",
  },
  isMobilePhone: {
    errorMessage: "invalid mobile number",
  },
  custom: {
    options: async (value) => {
      try {
        const user = await User.findOne({ mobileNumber: value });
        if (!user) {
          return true;
        } else {
          throw new Error("mobile number already exists");
        }
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};

const role = {
  notEmpty: {
    errorMessage: "please select which type of User your are ",
  },
  custom: {
    options: (value) => {
      const roles = ["owner", "shipper"];
      const result = roles.find((ele) => ele === value);
      if (!result) {
        throw new Error("invalid user type");
      } else {
        return true;
      }
    },
  },
};
const registerSchemaValidation = {
  firstName,
  password,
  email,
  mobileNumber,
  role,
};

module.exports = { registerSchemaValidation };
