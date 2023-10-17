require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConfig = require("./config/db");
const usersCltr = require("./app/controller/usersCltr");
const { checkSchema } = require("express-validator");
const {
  registerSchemaValidation,
  otpResendValidation,
  loginSchemaValidation,
} = require("./app/helper/registerSchemaValidation");
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3300;

dbConfig();

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

app.post("/api/login", checkSchema(loginSchemaValidation), usersCltr.login);

app.listen(port, () => {
  console.log("server running at port", port);
});
