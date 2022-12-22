const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/userDataBase");

module.exports = {
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await User.findOne({ email: userData.email });
      
      if (user && user.access) {
        bcrypt.compare(userData.nPassword, user.nPassword).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed! incorrect password!");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed!");
        resolve({ status: false });
      }
    });
  }
};
