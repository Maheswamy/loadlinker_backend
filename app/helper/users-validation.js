const User = require("../models/user-model");
// const {isEmail,isMobilePhone} = require('validator');

//not empty function

const notEmptyGenrator = (value) => {
  return {
    errorMessage: `${value} is required`,
    bail: true,
  };
};

const firstName = {
  notEmpty: notEmptyGenrator("First Name"),
};

const password = {
  notEmpty: notEmptyGenrator("password"),
  isStrongPassword: {
    errorMessage:
      "password should contain min 8 to max 128 characters with one lowercase , one uppercase, one Number and one Symsbol",
  },
};

const email = {
  notEmpty: notEmptyGenrator("Email"),
  isEmail: {
    errorMessage: "invalid email id",
    bail: true,
  },
  custom: {
    options: async (value) => {
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

const otpEmail = {
  notEmpty: notEmptyGenrator("Otp email"),
  isEmail: {
    errorMessage: "invalid email id",
    bail: true,
  },
  custom: {
    options: async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return true;
        } else {
          throw new Error("email not found");
        }
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};

const mobileNumber = {
  notEmpty: notEmptyGenrator("mobile number"),
  isAlphanumeric: {
    errorMessage: "please enter only digits",
    bail: true,
  },
  isMobilePhone: {
    errorMessage: "invalid mobile number",
    bail: true,
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
  notEmpty: notEmptyGenrator("Role"),
  isIn: {
    options: [["owner", "shipper"]],
    errorMessage: "Role should be either Owner or Shipper",
  },
};
const registerSchemaValidation = {
  firstName,
  password,
  email,
  mobileNumber,
  role,
};

const otpResendValidation = {
  email: otpEmail,
};

const loginSchemaValidation = {
  username: {
    notEmpty: {
      errorMessage: "username cannot be empty",
    },
  },
  password: {
    notEmpty: {
      errorMessage: "password cannot be empty",
    },
  },
  custom: {
    options: async (value) => {
      const validator = require("validator");
      if (
        validator.isEmail(value) ||
        validator.isMobilePhone(value, "any", { strictMode: false })
      ) {
        return true;
      } else {
        throw new Error("Invalid email or mobile number ");
      }
    },
  },
};

const otpVerificationSchema = {
  otp: {
    notEmpty: notEmptyGenrator("OTP"),
    isLength: {
      options: {
        min: 6,
        max: 6,
      },
      errorMessage: "OTP should be 6 digit",
      bail: true,
    },
  },
  email: otpEmail,
};

module.exports = {
  registerSchemaValidation,
  otpResendValidation,
  loginSchemaValidation,
  otpVerificationSchema,
};
