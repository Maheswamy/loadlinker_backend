const Bid = require("../models/bid-model");
const Enquiry = require("../models/enquiry-model");
const Shipment = require("../models/shipment-model");

const shipmentValidation = {
  bidId: {
    notEmpty: {
      errorMessage: "bid id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
      bail: true,
    },
    custom: {
      options: async (value, { req }) => {
        const bid = await Bid.findOne({
          _id: value,
          enquiryId: req.params.enquiryId,
        });
        if (!bid) {
          throw new Error("bid not found for this enquiry");
        } else {
          return true;
        }
      },
    },
  },
  enquiryId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "enquiry id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
      bail: true,
    },
    custom: {
      options: async (value, { req }) => {
        const result = await Enquiry.findOne({
          _id: value,
          shipperId: req.user.id,
        });
        if (!result) {
          throw new Error("This is not your Enquiry post");
        } else {
          return true;
        }
      },
    },
  },
};

const updateShipment = {
  shipmentId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "shipmentId id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
      bail: true,
    },
    custom: {
      options: async (value) => {
        const result = await Shipment.findOne({
          _id: value,
        });

        if (!result) {
          throw new Error("This is not your not your shipment ");
        } else {
          return true;
        }
      },
    },
  },
  status: {
    notEmpty: {
      errorMessage: "status is required",
      bail:true
    },
    isIn: {
      options: [["loaded", "unloaded", "canceled"]],
      errorMessage: "Please update only loaded and unloaded",
      bail:true
    },
    custom: {
      options: async (value, { req }) => {
        const result = await Shipment.findById(req.params.shipmentId);
        if (result.status == "waiting") {
          if (value === "loaded") {
            return true;
          } else {
            throw new Error("You can update only from waiting to loaded");
          }
        }

        if (result.status == "loaded") {
          if (value === "unloaded") {
            return true;
          } else {
            throw new Error("You can update only from waiting to loaded");
          }
        }
      },
    },
  },
};

module.exports = { shipmentValidation, updateShipment };
