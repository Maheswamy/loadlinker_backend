const shipmentId = {
  notEmpty: {
    errorMessage: "MongoId is Required",
    bail: true,
  },
  isMongoId: {
    errorMessage: "invalid mongoId",
    bail: true,
  },
};

const paymentValidation = {
  amount: {
    notEmpty: {
      errorMessage: "amount is reqiured",
      bail: true,
    },
  },
  shipmentId,
};

const paymentUpdateValidation = {
  shipmentId,
  transactionId: {
    notEmpty: {
      errorMessage: "TransactionId is required",
    },
  },
};

module.exports = { paymentValidation, paymentUpdateValidation };
