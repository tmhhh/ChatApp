const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModel = require("../models/user.model");
// const passport = require("passport");
module.exports = {
  initialize: (app, passport) => {
    app.use(passport.initialize());
    app.use(passport.session());
  },
  authenticate: (passport) => {
    passport.use(
      new GoogleStrategy(
        {
          clientID:
            "276022586484-2s9ui1rmhqvc8a6csc05nn2vcnva453d.apps.googleusercontent.com",
          clientSecret: "VoKthWq43LJJ6mSd4jTU8pzO",
          callbackURL: "http://localhost:4000/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, cb) => {
          const {
            _json: { name, picture },
            id,
          } = profile;
          try {
            const user = await userModel.findUser(id);
            // console.log(user);
            // console.log(result);
            if (user.length == 0) {
              const newUser = { userID: id, userName: name, userPic: picture };
              // console.log("new user");
              // console.log(newUser);
              await userModel.add(newUser);
              return cb(null, newUser);
            } else {
              // console.log("else");
              return cb(null, user[0]);
            }

            // console.log(user);
          } catch (error) {
            console.log(error);
          }
        }
      )
    );
  },
  serializeUser: (passport) => {
    passport.serializeUser(function (user, done) {
      // console.log("serial");

      done(null, user.userID);
    });
  },
  deserializeUser: (passport) => {
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await userModel.findUser(id);
        user.length > 0 ? done(null, user[0]) : done("cannot find user ", null);
      } catch (error) {
        done(error, null);
      }
    });
  },
  checkAuthenticated: (req, res, next) => {
    if (req.user) {
      next();
      return;
    }
    res.redirect("/");
  },
};
