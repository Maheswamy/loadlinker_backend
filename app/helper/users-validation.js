const User = require("../models/user-model");

const notEmptyGenerator = (value) => {
  return {
    errorMessage: `${value} is required`,
    bail: true,
  };
};

const firstName = {
  notEmpty: notEmptyGenerator("First Name"),
};

const password = {
  notEmpty: notEmptyGenerator("password"),
  isStrongPassword: {
    errorMessage:
      "password should contain min 8 to max 128 characters with one lowercase , one uppercase, one Number and one Symsbol",
  },
};

const email = {
  notEmpty: notEmptyGenerator("Email"),
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
        throw new Error(e.message);
      }
    },
  },
};

const otpEmail = {
  notEmpty: notEmptyGenerator("Otp email"),
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
        throw new Error(e.message);
      }
    },
  },
};

const mobileNumber = {
  notEmpty: notEmptyGenerator("mobile number"),
  isAlphanumeric: {
    errorMessage: "please enter the number not string",
    bail: true,
  },
  isLength: {
    options: {
      min: 10,
      max: 10,
    },
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
        throw new Error(e.message);
      }
    },
  },
};

const role = {
  notEmpty: notEmptyGenerator("Role"),
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
    notEmpty: notEmptyGenerator("OTP"),
    isLength: {
      options: {
        min: 4,
        max: 4,
      },
      errorMessage: "OTP should be 6 digit",
      bail: true,
    },
  },
  email: otpEmail,
};

const userUpdateValidation = {
  firstName: {
    notEmpty: {
      errorMessage: "First name is required",
    },
  },
  email: {
    notEmpty: notEmptyGenerator("Email"),
    isEmail: {
      errorMessage: "invalid email id",
      bail: true,
    },
    custom: {
      options: async (value, { req }) => {
        try {
          const user = await User.findOne({
            email: value,
            _id: { $ne: req.user.id },
          });
          if (!user) {
            return true;
          } else {
            throw new Error("email already exists");
          }
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },
  },
  mobileNumber: {
    notEmpty: notEmptyGenerator("mobile number"),
    isAlphanumeric: {
      errorMessage: "please enter the number not string",
      bail: true,
    },
    isLength: {
      options: {
        min: 10,
        max: 10,
      },
      errorMessage: "invalid mobile number",
      bail: true,
    },
    custom: {
      options: async (value, { req }) => {
        try {
          const user = await User.findOne({
            mobileNumber: value,
            _id: { $ne: req.user.id },
          });
          if (!user) {
            return true;
          } else {
            throw new Error("mobile number already exists");
          }
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },
  },
};

module.exports = {
  registerSchemaValidation,
  otpResendValidation,
  loginSchemaValidation,
  otpVerificationSchema,
  notEmptyGenerator,
  userUpdateValidation,
};
