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
const ownersCltr = require("./app/controller/ownerCltr");
const {
  vehicleSchemaValidation,
} = require("./app/helper/vehicleSchemaValidation");
const shipperCltr = require("./app/controller/shipperCltr");
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
  ownersCltr.addVehicle
);

app.post(
  "/api/vehicleTypes",
  authenticateUser,
  authorizeUser(["admin"]),
  ownersCltr.addVehicleType
);

app.get("/api/vehicleTypes", authenticateUser, ownersCltr.vehicleTypeList);

// shipper's end points

app.post(
  "/api/addloads",
  authenticateUser,
  authorizeUser(["shipper"]),
  checkSchema(addLoadValidation),
  shipperCltr.create
);
app.get("/api/allLoads", authenticateUser, shipperCltr.allEnquiry);
app.get(
  "/api/allLoads/:enquiryId",
  authenticateUser,
  shipperCltr.singleEnquiry
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
