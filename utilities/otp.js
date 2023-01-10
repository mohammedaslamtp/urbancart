const accountSid = process.env.SID;
const authToken = process.env.TOKEN;
const serviceId = process.env.SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

function sendOtp(mobile) {
  console.log("otp send");
  client.verify.v2
    .services(serviceId)
    .verifications.create({ to: `+91${mobile}`, channel: "sms" })
    .then((verification) => console.log("verification status : " + verification.status));
  console.log("otp sendddd");
}

function verifyOtp(mobile, otp) {
  return new Promise((resolve, reject) => {
    console.log("verifyOtp working...");
    client.verify.v2
      .services(serviceId)
      .verificationChecks.create({ to: `+91${mobile}`, code: otp })
      .then((verification_check) => {
        console.log("verification status:  " + verification_check.status);
        resolve(verification_check);
      });
    console.log("mobile:" + mobile);
  });
}

module.exports = {
  sendOtp,
  verifyOtp
};
