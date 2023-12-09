const User = require("../models/user-model");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const transporter = require("../helper/emailVerification");
const Payment = require("../models/payment-model");
const Bid = require("../models/bid-model");
const Shipment = require("../models/shipment-model");
const Enquiry = require("../models/enquiry-model");

const usersCltr = {};

const saltAndHash = async (value) => {
  const salt = await bcryptjs.genSalt();
  const hashed = await bcryptjs.hash(value, salt);
  return hashed;
};

const generateOTP = () => {
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  return otp;
};

// user reisteration controller
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
  console.log(body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }
    const otp = generateOTP();
    // const hasedOTP = await saltAndHash(otp);
    const updatedOtp = await User.findOne({ email: body.email });
    const mailOptions = {
      from: "mahendragowdas1997@gmail.com",
      to: updatedOtp.email,
      subject: `${updatedOtp.firstName} ${updatedOtp.lastName} OTP Verification Code`,
      text: `please use the following OTP code:${otp}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return res.status(500).json({ error });
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
      return res.status(400).json({ error: errors.array() });
    }
    const user = await User.findOne({
      $or: [{ email: body.username }, { mobileNumber: body.username }],
    });

    if (!user) {
      return res.status(400).json({ error: "invalid username or password" });
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
  const { id, role } = req.user;
  try {
    const user = await User.findById(id);
    const userData = _.pick(user, [
      "firstName",
      "lastName",
      "email",
      "mobileNumber",
      "reviews",
      "vehicles",
      "isVerified",
    ]);
    console.log(user, "sjdka");

    if (role === "shipper") {
      const [{ revenue }] = await Payment.aggregate([
        { $group: { _id: "$userId", revenue: { $sum: "$amount" } } },
      ]);
      userData.revenue = revenue;

      const averageBidsPerEnquiry = await Enquiry.aggregate([
        {
          $match: {
            shipperId: user._id,
          },
        },
        {
          $project: {
            numberOfBids: { $size: "$bids" }, // Count the number of bids in each enquiry
          },
        },
        {
          $group: {
            _id: null,
            totalBids: { $sum: "$numberOfBids" }, // Sum of all bids across enquiries
            totalEnquiries: { $sum: 1 }, // Count the total number of enquiries
          },
        },
        {
          $project: {
            _id: 0,
            averageBidsPerEnquiry: {
              $divide: ["$totalBids", "$totalEnquiries"],
            }, // Calculate the average
          },
        },
      ]);
      userData.bidsPerEnquiry = averageBidsPerEnquiry[0]?.averageBidsPerEnquiry;
      return res.json({ userData });
    }

    if (role === "owner") {
      const totalAmount = await Bid.aggregate([
        {
          $match: {
            userId: user._id, // Convert userId to ObjectId type
            status: "approved",
          },
        },
        {
          $group: {
            _id: null, // Grouping all documents together
            totalAmount: { $sum: "$bidAmount" },
          },
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field from the output
            totalAmount: 1,
          },
        },
      ]);

      userData.revenue = totalAmount[0]?.totalAmount;

      return res.json({ userData });
    }

    res.json({ userData });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

usersCltr.update = async (req, res) => {
  const { id } = req.user;
  const body = _.pick(req.body, [
    "firstName",
    "lastName",
    "mobileNumber",
    "email",
  ]);
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const errorFormat = errors.array().reduce((pv, cv) => {
        pv[cv.path] = cv.msg;
        return pv;
      }, {});
      return res.status(400).json(errorFormat);
    }
    const updatedProfile = await User.findByIdAndUpdate(id, body, {
      new: true,
    });
    const userData = _.pick(updatedProfile, [
      "firstName",
      "lastName",
      "email",
      "mobileNumber",
      "reviews",
      "vehicles",
      "isVerified",
    ]);
    res.json(userData);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

module.exports = usersCltr;
