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
} = require("./app/helper/users-validation");
const {
  authenticateUser,
  authorizeUser,
} = require("./app/middleware/userAuthorization");
const vehicleCltr = require("./app/controller/vehicleCltr");
const { vehicleSchemaValidation } = require("./app/helper/vehicle-validation");
const enquiryCltr = require("./app/controller/enquiryCltr");
const addLoadValidation = require("./app/helper/shippment-validation");
const {
  bidingSchemaValidation,
  bidUpdateValidation,
  bidRemoveValidation,
} = require("./app/helper/bid-validation");
const biddingCltr = require("./app/controller/bidingCltr");
const permitValidation = require("./app/helper/permitValidation");
const shipmentCltr = require("./app/controller/shipmentCltr");
const shipmentValidation = require("./app/helper/shipmentValidation");
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3300;
dbConfig();
const upload = multer();

//register end point
app.post(
  "/api/register",
  checkSchema(registerSchemaValidation),
  usersCltr.register
);

//OTP resend end point
app.get(
  "/api/register/otp",
  checkSchema(otpResendValidation),
  usersCltr.resendOtp
);

// OTP verification end point
app.post(
  "/api/register/otp",
  checkSchema(otpVerificationSchema),
  usersCltr.otpVerification
);

app.post("/api/login", checkSchema(loginSchemaValidation), usersCltr.login);

app.get("/api/users/profile", authenticateUser, usersCltr.profile);

//vehicle api's
// add vehicle end point for owner and admin
app.post(
  "/api/vehicles",
  upload.fields([{ name: "vehicleImage" }, { name: "rc" }]),
  authenticateUser,
  authorizeUser(["owner", "admin"]),
  checkSchema(vehicleSchemaValidation),
  vehicleCltr.addVehicle
);

//all vehicle list
app.get(
  "/api/vehicles",
  authenticateUser,
  authorizeUser(["admin", "owner"]),
  vehicleCltr.list
);

//single vehicle details
app.get(
  "/api/vehicles/:vehicleId",
  authenticateUser,
  authorizeUser(["admin", "owner"]),
  vehicleCltr.singleVehicle
);

//vehicle details update

app.put(
  "/api/vehicles/:vehicleId",
  authenticateUser,
  authorizeUser(["admin", "owner"]),
  vehicleCltr.update
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
  enquiryCltr.create
);
app.get("/api/marketplace", authenticateUser, enquiryCltr.allEnquiry);
app.get(
  "/api/marketplace/:enquiryId",
  authenticateUser,
  enquiryCltr.singleEnquiry
);

// api for biding the amount for load

app.post(
  "/api/bids",
  authenticateUser,
  authorizeUser(["owner"]),
  checkSchema(bidingSchemaValidation),
  biddingCltr.create
);

// modifying the bid placed by owner of vehicle

app.put(
  "/api/bids/:bidId",
  authenticateUser,
  authorizeUser(["owner"]),
  checkSchema(bidUpdateValidation),
  biddingCltr.update
);

app.delete(
  "/api/bidding/:enquiryLoadId/:bidId",
  authenticateUser,
  authorizeUser(["owner"]),
  checkSchema(bidRemoveValidation),
  biddingCltr.remove
);

app.post(
  "/api/vehicles/permit",
  authenticateUser,
  authorizeUser(["admin"]),
  checkSchema(permitValidation),
  vehicleCltr.addPermit
);

// shipment approve api

app.post(
  "/api/shipments/:enquiryId",
  authenticateUser,
  authorizeUser(["shipper", "admin"]),
  checkSchema(shipmentValidation),
  shipmentCltr.approve
);

app.listen(port, () => {
  console.log("server running at port", port);
});
