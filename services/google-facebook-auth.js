const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("users");

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

// Google Auth
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_AUTH_SECRET,
        callbackURL: "https://clumsy-glasses-clam.cyclic.app/api/auth/google/callback"
    },
     (accessToken, refreshToken, profile, done) => {
     
      // check if user id already exists
     // const user = User.findOne({userId: profile.id})
        User.findOne({ userId: profile.id }).then(async (existingUser) => {
            if (existingUser) {
                console.log("user exists")
            done(null, existingUser);
            } else {
                console.log("about to add a new user with id", profile)
          // adding new user
          const userToSave = new User({
            userId: profile.emails[0].value,
            googleId: profile.id,
            status: "Active",
          //  confirmationCode: '123456'
        });

        const result = await userToSave.save();
        await done(null, result)
                // .save()
                // .then((user) => {
                //     done(null, user);
                // });
            }
        });
    }
  )
);

// Facebook Auth
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: "/api/auth/facebook/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       console.log(profile);
//       // check if user id already exists
//       User.findOne({ userId: profile.id }).then((existingUser) => {
//         if (existingUser) {
//           done(null, existingUser);
//         } else {
//           // adding new user
//           console.log("Adding a new user");
//           new User({
//             userId: profile.id,
//             status: "Active",
//           })
//             .save()
//             .then((user) => {
//               done(null, user);
//             });
//         }
//       });
//     }
//   )
// );

