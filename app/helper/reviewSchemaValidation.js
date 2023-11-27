const Shipment = require("../models/shipment-model");

const reviewSchemaValidation = {
  rating: {
    notEmpty: {
      errorMessage: "Rating is required",
      bail: true,
    },
    isNumeric: {
      options: {
        min: 0,
        max: 5,
      },
      errorMessage: "Rating should 0 to 5",
    },
  },
  feedback: {
    notEmpty: {
      errorMessage: "feedback is required",
    },
  },

  shippmentId: {
    notEmpty: {
      errorMessage: "shippment Id is required",
      bail: true,
    },
    isMongoId: {
      errorMessage: "invalid mongo Id ",
      bail: true,
    },
    custom: {
      option: async (value, { req }) => {
        const result = await Shipment.findOne({
          _id: value,
          shipper: req.user.id,
        });
        if (!result) {
          throw new Error(
            "you are authorise to write review for this Shipment"
          );
        } else {
          return true;
        }
      },
    },
  },
};

module.exports = reviewSchemaValidation;
