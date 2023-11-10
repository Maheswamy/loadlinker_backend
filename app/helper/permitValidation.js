const Permit = require("../models/permit-model");

const permitValidation = {
  state: {
    notEmpty: {
      errorMessage: "state is required",
      bail: true,
    },

    isIn: {
      options: [
        [
          "Andhra Pradesh",
          "Arunachal Pradesh",
          "Assam",
          "Bihar",
          "Chhattisgarh",
          "Goa",
          "Gujarat",
          "Haryana",
          "Himachal Pradesh",
          "Jharkhand",
          "Karnataka",
          "Kerala",
          "Madhya Pradesh",
          "Maharashtra",
          "Manipur",
          "Meghalaya",
          "Mizoram",
          "Nagaland",
          "Odisha",
          "Punjab",
          "Rajasthan",
          "Sikkim",
          "Tamil Nadu",
          "Telangana",
          "Tripura",
          "Uttar Pradesh",
          "Uttarakhand",
          "West Bengal",
          "Jammu and Kashmir",
        ],
      ],
      errorMessage: "only select the available permit ",
    },
    custom: {
      options: async (value) => {
        const permit = await Permit.findOne({ state: value });
        if (!permit) {
          return true;
        } else {
          throw new Error("State permit already created ");
        }
      },
    },
  },
};

module.exports = permitValidation;
