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

app.listen(port, () => {
  console.log("server running at port", port);
});
