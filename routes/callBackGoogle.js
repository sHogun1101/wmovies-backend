const express = require("express");
const router = express.Router();
const passport = require("passport");
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  function (req, res, next) {
    passport.authenticate("google", (err, profile) => {
      req.user = profile;
      next();
    })(req, res, next);
  },
  (req, res) => {
    res.redirect(
      `${process.env.URL_CLIENT}/user/google/callback?user=${req.user?.id}&token=${req.user?.token_login}`
    );
  }
);
module.exports = router;
