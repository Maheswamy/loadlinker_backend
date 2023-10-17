const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;

const twilio = require("twilio");

const client = new twilio(accountSid, authToken);


const otpSender = async (otp, mobileNumber) => {
  console.log(otp, mobileNumber);
  try {
    const message = await client.messages.create({
      body: `please use the following OTP to continue with LoadLinker ${otp}`,
      from: `+19143803829`,
      to: `+91${mobileNumber}`,
    });

    return message;
  } catch (e) {
    console.log(e, "twilio error");
  }
};

module.exports = otpSender;
