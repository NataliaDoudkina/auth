const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("./nodemailer-service.js");
let User = mongoose.model("users");
const { v4: uuidv4 } = require("uuid");

module.exports.registerUser = async (userData, req, res) => {
  if (userData.password !== userData.password2) {
    res.send("Passwords do not match");
  }
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const confirmationCode = uuidv4();
  const userToSave = new User({
    userId: userData.email,
    password: hashedPassword,
    confirmationCode,
  });
 
  const response = await saveUser(userToSave, confirmationCode);
  return response;
};

const saveUser = async (user, token) => {
  try {
    const result = await user.save();
    if (result) {
      await nodemailer.sendConfirmationEmail(result.userId, token);
      return `Pending registration confirmation for ${result.userId}`;
    }
  } catch (err) {
    if (err.code === 11000) {
      return "This email address is already associated with an account";
    }
    return `There was an error in sending confirmation email ${err.code}`;
  }
};

module.exports.checkUser = (userData) => {
  return new Promise(function (resolve, reject) {
    User.findOne({ userId: userData.email })
      .exec()
      .then((user) => {
        bcrypt.compare(userData.password, user.password).then((res) => {
          if (user.status != "Active") {
            reject(
              "Pending Account. Please verify your email to gain access to your profile"
            );
          }
          if (res === true) {
            resolve(user);
          } else {
            reject("Incorrect password for user " + userData.email);
          }
        });
      })
      .catch((err) => {
        reject("Unable to find user " + userData.email);
      });
  });
};

module.exports.verifyUserEmail = async (confirmationCode) => {
  console.log("in verify user email")
    try {
        const user = await User.findOne({ confirmationCode: confirmationCode });
        if (!user) {
          return "User not found";
        }
        const payload = {
          _id: user._id,
          userId: user.userId,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        user.status = "Active";
        const result = await user.save();
        if (result) {
          return token;
        }
    } catch(e) {
        console.log(e)
    }
};
