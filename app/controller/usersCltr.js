const User = require("../models/user-model");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const transporter = require("../helper/emailVerification");

const usersCltr = {};

const saltAndHash = async (value) => {
  const salt = await bcryptjs.genSalt();
  const hashed = await bcryptjs.hash(value, salt);
  return hashed;
};

const generateOTP = () => {
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  return otp;
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
    const otp = generateOTP();

    const mailOptions = {
      from: "mahendragowdas1997@gmail.com",
      to: body.email,
      subject: `${body.firstName} ${body.lastName} OTP Verification Code`,
      text: `please use the following OTP code:${otp}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return res.status(500).json({ error: "Error sending email" });
      } else {
        body.otp = await saltAndHash(otp);
        const newUser = await new User(body).save();
        return res
          .status(200)
          .json({ message: "Email sent successfully", name: newUser.email });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

module.exports = usersCltr;



