const Bid = require("../models/bid-model");
const Enquiry = require("../models/enquiry-model");
const Vehicle = require("../models/vehicle-model");

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
        const vehicle = await Vehicle.findOne({
          _id: value,
          ownerId: req.user.id,
        });
        const enquiry = await Enquiry.findById(req.body.enquiryId);
        if (!vehicle) {
          throw new Error("vehicle not present");
        }
        if (vehicle.isVerified !== "approved") {
          throw new Error("vehicle not approved");
        }
        if (vehicle.loaded) {
          throw new Error(
            "vehicle is already loaded, you bid only after unload "
          );
        }
        if (vehicle.permittedLoadCapacity < enquiry.loadWeight) {
          throw new Error(
            "maximum load capacity of your vehicle is less than Enquiy load"
          );
        }
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
  bidId: {
    in:['params'],
    notEmpty: {
      errorMessage: "enquiry id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo id",
    },
  },
};

module.exports = {
  bidingSchemaValidation,
  bidUpdateValidation,
  bidRemoveValidation,
};
