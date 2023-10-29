const Bid = require("../models/bid-model");
const Enquiry = require("../models/enquiry-model");

const bidingSchemaValidation = {
  enquiryId: {
    notEmpty: {
      errorMessage: "Enquiry Id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
    },
  },
  bidAmount: {
    notEmpty: {
      errorMessage: "bidding amount is required",
      bail: true,
    },
    isNumeric: {
      errorMessage: "bidding amount should be in digit",
    },
  },
  vehicleId: {
    notEmpty: {
      errorMessage: "please select the vehicle ",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
      bail: true,
    },
    custom: {
      options: async (value, { req, res }) => {
        const bid = await Bid.findOne({
          vehicleId: value,
          enquiryId: req.body.enquiryId,
          userId: req.user.id,
        });
        if (bid) {
          throw new Error("use already bidded to this Enquiry");
        } else {
          return true;
        }
      },
    },
  },
};

const bidUpdateValidation = {
  bidId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "bid id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
    },
  },
  bidAmount: {
    notEmpty: {
      errorMessage: "bidding amount is required",
      bail: true,
    },
    isNumeric: {
      errorMessage: "bidding amount should be in digit",
    },
  },
};

const bidRemoveValidation = {
  enquiryLoadId: {
    notEmpty: {
      errorMessage: "enquiry id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
    },
  },
  bidId: {
    notEmpty: {
      errorMessage: "enquiry id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
    },
  },
};

module.exports = { bidingSchemaValidation, bidUpdateValidation,bidRemoveValidation };
