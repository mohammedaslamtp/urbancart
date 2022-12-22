const userHelpers = require("../helpers/userHelpers");
const mongoose = require("mongoose");
const otp = require("../utilities/otp");
const bcrypt = require("bcrypt");
const customer = require("../models/userDataBase");

module.exports = {
  /* user home page */
  home: (req, res) => {
    let users = req.session.user;
    res.render("user/index", { users, user: true, admin: false });
  },

  /* user login submition case */
  userLogIn: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.user = response.user;
        req.session.loggedIn = true;
        res.redirect("/");
      } else {
        req.session.loggedIn = false;
        req.session.loginErr = "Invalid username or password";
        res.redirect("/login");
      }
    });
  },

  /* user login page */
  login: (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("user/login", { user: false, admin: false, logErr: req.session.loginErr });
      req.session.loginErr = false;
    }
  },

  /* user signup page */
  signup: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/signup", { user: false, admin: false });
    }
  },

  /* user signup submition case */
  userSignUp: async (req, res) => {
    try {
      const email = req.body.email;
      const phone = req.body.phone;
      req.session.signup = req.body;
      const user = await customer.findOne({ email: email });
      console.log("userSignUp working...");
      if (user) {
        req.session.loggedIn = true;
        res.redirect("/");
      } else {
        otp.sendOtp(phone);
        res.render("user/otpSection", { user: false, admin: false, phone });
      }
    } catch (error) {
      console.log(error);
    }
  },

  /* otp generation for create a account and store data into database */
  generateOtp: async (req, res) => {
    try {
      console.log("generateOtp working...");
      console.log("req.session.signup ===> " + req.session.signup);
      let { fullName, email, phone, nPassword, cPassword } = req.session.signup;
      let otps = req.body.otps;
      console.log("otps ===> " + otps);
      await otp.verifyOtp(phone, otps).then(async (verification_check) => {
        console.log("before ===> " + verification_check.status);
        if (verification_check.status == "approved") {
          console.log("after ===> " + verification_check.status);
          console.log("passwords ::====> " + nPassword, cPassword);
          nPassword = await bcrypt.hash(nPassword, 10);
          cPassword = await bcrypt.hash(cPassword, 10);
          console.log("otp verifying");
          let newPerson = new customer({
            fullName: fullName,
            email: email,
            phone: phone,
            nPassword: nPassword,
            cPassword: cPassword
          });
          newPerson.save((err, newUser) => {
            if (err) {
              console.log(err);
              res.redirect("/signup");
            } else {
              req.session.loggedIn = true;
              res.redirect("/");
            }
          });
          console.log("new person added to database ===> " + newPerson);
        } else {
          req.session.loggedIn = false;
          res.send("otp error! otp did not match!");
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  /* logout router */
  userLogOut: (req, res) => {
    req.session.loggedIn = false;
    req.session.user = null;
    res.redirect("/");
  }
};
