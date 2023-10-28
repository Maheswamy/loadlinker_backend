const Enquiry = require("../models/enquiry-model");

const bidingSchemaValidation = {
  enquiryLoadId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "Load Id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
    },
  },
  bidAmount: {
    notEmpty: {
      errorMessage: "biding amount  is required",
      bail: true,
    },
    isNumeric: {
      errorMessage: "bising amount should be in digit",
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
        console.log(value, req.params);
        const enquiry = await Enquiry.findById(req.params.enquiryLoadId);
        const result = enquiry.bids.find((ele) => ele.vehicleId == value);
        if (result) {
          throw new Error("you already bided to this enquiry");
        } else {
          return true;
        }
      },
    },
  },
};

const bidRemoveValidation = {
  enquiryLoadId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "enquiry id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
    },
  },
  bidId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "enquiry id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
    },
  },
};

module.exports = { bidingSchemaValidation, bidRemoveValidation };
