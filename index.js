require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConfig = require("./config/db");
const usersCltr = require("./app/controller/usersCltr");
const { checkSchema } = require("express-validator");
const multer = require("multer");
const {
  registerSchemaValidation,
  otpResendValidation,
  loginSchemaValidation,
  otpVerificationSchema,
} = require("./app/helper/registerSchemaValidation");
const {
  authenticateUser,
  authorizeUser,
} = require("./app/middleware/userAuthorization");
const vehicleCltr = require("./app/controller/vehicleCltr");
const {
  vehicleSchemaValidation,
} = require("./app/helper/vehicleSchemaValidation");
const shippmentCltr = require("./app/controller/ShippmentCltr");
const addLoadValidation = require("./app/helper/addLoadValidation");
const bidingSchemaValidation = require("./app/helper/bidingSchemaValidation");
const biddingCltr = require("./app/controller/bidingCltr");
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3300;

dbConfig();

const upload = multer();

app.post(
  "/api/register",
  checkSchema(registerSchemaValidation),
  usersCltr.register
);

app.get(
  "/api/register/otp",
  checkSchema(otpResendValidation),
  usersCltr.resendOtp
);
app.post(
  "/api/register/otp",
  checkSchema(otpVerificationSchema),
  usersCltr.otpVerification
);
app.post("/api/login", checkSchema(loginSchemaValidation), usersCltr.login);

app.get("/api/users/profile", authenticateUser, usersCltr.profile);

app.post(
  "/api/addvehicles",
  upload.fields([{ name: "vehicleImage" }, { name: "rc" }]),
  authenticateUser,
  authorizeUser(["owner"]),
  checkSchema(vehicleSchemaValidation),
  vehicleCltr.addVehicle
);

app.post(
  "/api/vehicleTypes",
  authenticateUser,
  authorizeUser(["admin"]),
  vehicleCltr.addVehicleType
);

app.get("/api/vehicleTypes", authenticateUser, vehicleCltr.vehicleTypeList);

// shipper's end points

app.post(
  "/api/addloads",
  authenticateUser,
  authorizeUser(["shipper"]),
  checkSchema(addLoadValidation),
  shippmentCltr.create
);
app.get("/api/allLoads", authenticateUser, shippmentCltr.allEnquiry);
app.get(
  "/api/allLoads/:enquiryId",
  authenticateUser,
  shippmentCltr.singleEnquiry
);

// api for biding the amount for load

app.post(
  "/api/biding/:enquiryLoadId",
  authenticateUser,
  authorizeUser(["owner"]),
  checkSchema(bidingSchemaValidation),
  biddingCltr.create
);

// modifying the bid placed by owner of vehicle

app.put(
  "/api/biding/:enquiryLoadId/:bidId",
  authenticateUser,
  authorizeUser(["owner"]),
  biddingCltr.update
);

app.listen(port, () => {
  console.log("server running at port", port);
});
