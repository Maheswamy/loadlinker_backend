const Bid = require("../models/bid-model");
const Enquiry = require("../models/enquiry-model");

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
      options: async (value,{req}) => {
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

module.exports = shipmentValidation;
