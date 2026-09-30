const router = require("express").Router();

const passport = require("passport");
const authController = require("../auth/auth.controller");
const { authenticate } = require("../../middleware/auhtentication");

router.get(
  "/google",
  (req, res, next) => {
    console.log("Google auth route hit");
    console.log("Callback:", `${process.env.BASE_URL}/api/auth/google/callback`);
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/login-failed",
  }),
  authController.googleCallback
);

router.get("/profile", authenticate, authController.getProfile);
router.post("/send-otp",  authController.sendOtp);
router.post("/otp-login",  authController.verifyLoginOtp);


module.exports = router;