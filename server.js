/*
 * Server for user auth service, connects to MongoDB and listens for requests
 */

const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const passport = require("passport");
const mongoose = require("mongoose");

require("./models/User");
require("./services/google-facebook-auth");
require("./services/email-auth");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors(
    {}
));
app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));
//app.use(express.urlencoded());
mongoose.connect(
    'mongodb+srv://wefriiends-backup:wefriiends2023@cluster0.wir50id.mongodb.net/authorization?retryWrites=true&w=majority',
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    },
   
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.use(passport.initialize());
app.use(passport.session());

require("./routes/authRoutes")(app);

app.listen(HTTP_PORT, () => {
  console.log("API listening on: " + HTTP_PORT);
});