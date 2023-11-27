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
const {
  vehicleRegisterValidation,
  vehicleUpdateValidation,
} = require("./app/helper/vehicle-validation");
const enquiryCltr = require("./app/controller/enquiryCltr");
const {
  enquiryIdValidation,
  enquiryValidation,
  enquiryCalculationValidation,
} = require("./app/helper/Enquiry-validation");
const {
  bidingSchemaValidation,
  bidUpdateValidation,
  bidRemoveValidation,
} = require("./app/helper/bid-validation");
const biddingCltr = require("./app/controller/bidingCltr");
const permitValidation = require("./app/helper/permitValidation");
const shipmentCltr = require("./app/controller/shipmentCltr");
const {
  shipmentValidation,
  updateShipment,
} = require("./app/helper/shipmentValidation");
const { verifyUser } = require("./app/middleware/verifiyUser");
const paymentCltr = require("./app/controller/paymentCltr");
const app = express();

app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3300;

const socketIo = require("socket.io");
const { createServer } = require("http");
const reviewSchemaValidation = require("./app/helper/reviewSchemaValidation");
const reviewCltr = require("./app/controller/reviewCltr");
const server = createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // or the origin you want to allow
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true,
  },
});
require("./config/webSocket")(io);
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
  checkSchema(vehicleRegisterValidation),
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
  upload.fields([{ name: "vehicleImage" }, { name: "rc" }]),
  authenticateUser,
  authorizeUser(["owner"]),
  checkSchema(vehicleUpdateValidation),
  vehicleCltr.update
);

// add vehicle type
app.post(
  "/api/vehicleTypes",
  authenticateUser,
  authorizeUser(["admin"]),
  vehicleCltr.addVehicleType
);

app.get("/api/vehicleTypes", authenticateUser, vehicleCltr.vehicleTypeList);

//calculate the enquiry
app.post(
  "/api/enquiries/calculate",
  authenticateUser,
  authorizeUser(["admin", "shipper"]),
  // checkSchema(enquiryCalculationValidation),
  verifyUser,
  enquiryCltr.calculate
);

// post enquiry
app.post(
  "/api/enquiries/create",
  authenticateUser,
  authorizeUser(["admin", "shipper"]),
  // checkSchema(enquiryValidation),
  enquiryCltr.create
);

// api for get all enquiries of shipper
app.get(
  "/api/enquiries",
  authenticateUser,
  authorizeUser(["admin", "shipper"]),
  enquiryCltr.myEnquiries
);

app.delete(
  "/api/enquiries/:enquiryId",
  authenticateUser,
  authorizeUser(["admin", "shipper"]),
  checkSchema(enquiryIdValidation),
  enquiryCltr.remove
);

//api for all enquiries for owners
app.get("/api/marketplace", enquiryCltr.allEnquiry);
app.get("/api/count", authenticateUser, enquiryCltr.count);

// api for details of single enquiry
app.get(
  "/api/enquiries/:enquiryId",
  authenticateUser,
  authorizeUser(["admin", "shipper", "owner"]),
  checkSchema(enquiryIdValidation),
  enquiryCltr.singleEnquiry
);

// api for biding the amount for load

app.post(
  "/api/bids",
  authenticateUser,
  authorizeUser(["owner"]),
  verifyUser,
  checkSchema(bidingSchemaValidation),
  biddingCltr.create
);

// api for all bids
app.get(
  "/api/bids",
  authenticateUser,
  authorizeUser(["owner", "admin"]),
  biddingCltr.list
);
app.get(
  "/api/bids/:enquiryId",
  authenticateUser,
  authorizeUser(["shipper", "admin"]),
  biddingCltr.list
);

//api for single
app.get(
  "/api/mybids/:bidId",
  authenticateUser,
  authorizeUser(["owner", "admin"]),
  biddingCltr.singleBid
);

// modifying the bid placed by owner of vehicle

app.put(
  "/api/mybids/:bidId",
  authenticateUser,
  authorizeUser(["owner"]),
  checkSchema(bidUpdateValidation),
  biddingCltr.update
);

app.delete(
  "/api/mybids/:bidId",
  authenticateUser,
  authorizeUser(["owner"]),
  checkSchema(bidRemoveValidation),
  biddingCltr.remove
);

app.post(
  "/api/permits",
  authenticateUser,
  authorizeUser(["admin"]),
  checkSchema(permitValidation),
  vehicleCltr.addPermit
);

app.get(
  "/api/permits",
  authenticateUser,
  authorizeUser(["admin", "owner"]),
  vehicleCltr.permitList
);

// shipment approve api

app.post(
  "/api/shipments/:enquiryId",
  authenticateUser,
  authorizeUser(["shipper", "admin"]),
  checkSchema(shipmentValidation),
  shipmentCltr.approve
);

// shipment list api

app.get(
  "/api/shipments",
  authenticateUser,
  authorizeUser(["admin", "shipper", "owner"]),
  shipmentCltr.list
);

app.put(
  "/api/shipments/:shipmentId",
  authenticateUser,
  authorizeUser(["admin", "owner", "shipper"]),
  checkSchema(updateShipment),
  shipmentCltr.update
);

// // single shipment api
// app.get(
//   "/api/shipments/:shipmentId",
//   authenticateUser,
//   authorizeUser(["admin", "shipper"]),
//   shipmentCltr.singleShipment
// );

// payment create

app.post(
  "/api/payment",
  authenticateUser,
  authorizeUser(["shipper"]),
  paymentCltr.create
);

app.put(
  "/api/payment",
  authenticateUser,
  authorizeUser(["shipper"]),
  paymentCltr.update
);

// review api

app.post(
  "api/reviews",
  authenticateUser,
  authorizeUser(["shipper"]),
  checkSchema(reviewSchemaValidation),
  reviewCltr.create
);

server.listen(port, () => {
  console.log("server running at port", port);
});
