const express = require("express");
const router = express.Router();
const passport = require("passport");
const authenticate = require("../middlewares/authenticate.mdw");
const { addNewRoom } = require("../controllers/room.controller");
const { chatHome } = require("../controllers/chat.controller");
const { getUserMessages } = require("../controllers/message.controller");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("login");
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
router.get("/chat", authenticate.checkAuthenticated, chatHome);

//
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/chat");
  }
);
router.get("/userInfo", (req, res) => {
  res.status(200).json(req.user);
});
// add room

router.post("/room/add", authenticate.checkAuthenticated, addNewRoom);

//

authenticate.serializeUser(passport);

authenticate.authenticate(passport);

authenticate.deserializeUser(passport);

//check
router.get("/info", function (req, res, next) {
  console.log(req.user);
  res.json(req.user);
});

router.get("/user/messages", authenticate.checkAuthenticated, getUserMessages);
module.exports = router;
