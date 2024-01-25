const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const passport = require("passport");
const mongoose = require("mongoose");
const oneDay = 1000 * 60 * 60 * 24;
const expressSession = require('express-session')
var cookieSession = require('cookie-session');
const session = {
    name: 'session',
    keys: ['secret'],
    maxAge: 60*60*1000, 
//    secret: 'secret',
//    resave: true ,
//    saveUninitialized: true ,
//    cookie: {
//     maxAge: 60*60*1000, 
//     sameSite: 'none',
//      httpOnly: false
//    }
}
const expSession = {
      secret: "secret",
     resave: true ,
     saveUninitialized: true ,
     cookie: { 
         maxAge: 60*60*1000, 
        sameSite: 'none',
         httpOnly: false
    //secure: false
}}
  app.set('trust proxy', 1) 
//app.enable('trust proxy');
// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//  // sess.cookie.secure = true // serve secure cookies
// }
//"https://warm-frangollo-93bfd5.netlify.app"
const HTTP_PORT = process.env.PORT || 8080;
//https://warm-frangollo-93bfd5.netlify.app
app.use(express.json());
app.use(
    cors(
    {origin: "http://localhost:3000",
    credentials: true
}
)
);

//app.use(expressSession(session));
app.use(cookieSession(session));

app.use(passport.initialize());
app.use(passport.session());
require("./models/User");
require("./services/google-facebook-auth");
require("./services/email-auth");
require("./services/updatePassword");

require("./routes/authRoutes")(app);
require("./routes/updatePassword")(app);
mongoose.connect(
    "mongodb+srv://wefriiends-backup:wefriiends2023@cluster0.wir50id.mongodb.net/authorization?retryWrites=true&w=majority",
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
    console.log("Connection Successful!");
    app.listen(HTTP_PORT, () => {
        console.log("API listening on: " + HTTP_PORT);
    });
   
});
app.listen(HTTP_PORT, () => {
    console.log("Listen on the port 3000...");
});

