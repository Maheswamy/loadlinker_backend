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
        body.otp = otp;
        const newUser = await new User(body).save();
        return res
          .status(201)
          .json({ message: "Email sent successfully", email: newUser.email });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

usersCltr.resendOtp = async (req, res) => {
  const body = _.pick(req.body, ["email"]);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }
    const otp = generateOTP();
    // const hasedOTP = await saltAndHash(otp);
    const mailOptions = {
      from: "mahendragowdas1997@gmail.com",
      to: updatedOtp.email,
      subject: `${updatedOtp.firstName} ${updatedOtp.lastName} OTP Verification Code`,
      text: `please use the following OTP code:${otp}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return res.status(500).json({ error: "Error sending email" });
      } else {
        const updatedOtp = await User.findOneAndUpdate(
          { email: body.email },
          { otp: otp },
          { new: true }
        );
        return res.status(200).json({
          message: "Email sent successfully",
          email: updatedOtp.email,
        });
      }
    });
  } catch (e) {
    res.status(500).json(e);
  }
};

usersCltr.otpVerification = async (req, res) => {
  const body = _.pick(req.body, ["otp", "email"]);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findOne({ email: body.email });

    if (body.otp != user.otp) {
      return res.status(400).json({ error: "invalid OTP" });
    }
    const userUpdate = await User.findOneAndUpdate(
      { email: body.email },
      { isVerified: true, otp: null },
      { new: true }
    );
    res.json({ message: `account verified ${userUpdate.firstName}` });
  } catch (e) {
    res.status(500).json(e);
  }
};

usersCltr.login = async (req, res) => {
  const body = _.pick(req.body, ["username", "password"]);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findOne({
      $or: [{ email: body.username }, { mobileNumber: body.username }],
    });

    if (!user) {
      return res.status(400).json({ errors: "invalid username or password" });
    }
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ error: "please verify account before login" });
    }
    const result = await bcryptjs.compare(body.password, user.password);
    if (!result) {
      return res.status(400).json({ error: "invalid username or password" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );
    res.status(200).json({ token: `bearer ${token}` });
  } catch (e) {
    res.status(500).json(e);
  }
};

usersCltr.profile = async (req, res) => {
  const { id } = req.user;
  console.log(id, "cly");
  try {
    const user = await User.findById(id);
    console.log(user);
    const responseDate = _.pick(user, [
      "firstName",
      "lastName",
      "email",
      "mobileNumber",
      "reviews",
    ]);
    res.json({ profileData: responseDate });
  } catch (e) {
    res.status(500).json(e);
  }
};

module.exports = usersCltr;
