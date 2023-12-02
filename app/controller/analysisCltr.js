const User = require("../models/user-model");
const Shipment = require("../models/shipment-model");
const Vehicle = require("../models/vehicle-model");
const Bid = require("../models/bid-model");
const Payment = require("../models/payment-model");

const analysisCltr = {};

analysisCltr.allInfo = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $match: {
          role: { $ne: "admin" }, // Exclude documents with the role "admin"
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" }, // Extract the month from the createdAt field
          role: "$role",
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
            role: "$role",
          },
          numberOfUser: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0, // Exclude the default _id field from the output
          month: "$_id.month",
          role: "$_id.role",
          numberOfUser: 1,
        },
      },

      {
        $sort: {
          month: 1, // Sort by month in ascending order
          role: 1, // Sort by role in ascending order
        },
      },
    ]);

    const totalUser = users.reduce((pv, cv) => {
      pv += cv.numberOfUser;
      return pv;
    }, 0);

    const shipments = await Shipment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          statusOfShipment: "$_id",
          count: 1,
        },
      },
    ]);

    const perMonthShipment = await Shipment.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" }, // Extract the month from the createdAt field
        },
      },
      {
        $group: {
          _id: "$month",
          shipmentOfMonth: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field from the output
          month: "$_id",
          shipmentOfMonth: 1,
        },
      },
      {
        $sort: {
          month: 1, // Sort by month in ascending order
        },
      },
    ]);

    const totalNumberOfVehicle = await Vehicle.find({
      isVerified: "approved",
    }).count();

    // average bids per enquiry
    const [averageBidPerEnquiry] = await Bid.aggregate([
      { $group: { _id: "$enquiryId", totalBids: { $sum: 1 } } },
      {
        $group: {
          _id: null,
          averageBids: { $avg: "$totalBids" },
        },
      },
      {
        $project: {
          _id: 0,
          averageBids: 1,
        },
      },
    ]);

    // total revenue

    const [{ totalRevenue }] = await Payment.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      { $project: { _id: 0, totalRevenue: 1 } },
    ]);

    const result = {
      users,
      totalUser,
      shipments,
      perMonthShipment,
      totalNumberOfVehicle,
      averageBidPerEnquiry: +averageBidPerEnquiry.averageBids.toFixed(2),
      totalRevenue,
    };
    res.json(result);
  } catch (e) {
    res.status(500).json(e.message);
  }
};

module.exports = analysisCltr;
