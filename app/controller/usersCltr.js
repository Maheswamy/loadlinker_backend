const User = require("../models/user-model");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const otpSender = require("../helper/otpSender");

const usersCltr = {};

const saltAndHash = async (value) => {
  const salt = await bcryptjs.genSalt();
  const hashedOtp = await bcryptjs.hash(value, salt);
  return hashedOtp;
};

const generateOTP = async (mobileNumber) => {
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  otpSender(otp, mobileNumber);
  return saltAndHash(otp);
};

usersCltr.register = async (req, res) => {
  const body = _.pick(req.body, [
    "firstName",
    "lastName",
    "password",
    "mobileNumber",
    "email",
    "role",
  ]);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const length = await User.count();
    if (length == 0) {
      body.role = "admin";
    }
    body.password = await saltAndHash(body.password);
    body.otp = await generateOTP(body.mobileNumber);
    const newUser = await new User(body).save();

    res.json({
      message: "Otp sent to mobile number",
      name: newUser.firstName + newUser.lastName,
    });
  } catch (e) {
    res.status(500).json(e);
  }
};

module.exports = usersCltr;
