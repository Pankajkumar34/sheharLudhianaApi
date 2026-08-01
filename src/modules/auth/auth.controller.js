
const jwt = require("../../utils/jwt");
const authService = require("./auth.service");

const User = require("../user/user.model");

exports.googleCallback = async (req, res, next) => {
  try {

    const accessToken = jwt.generateAccessToken(req.user._id);
    const refreshToken = jwt.generateRefreshToken(req.user._id);


    await User.findByIdAndUpdate(req.user._id, {
      refreshToken: refreshToken,
      lastLogin: new Date(),
    });

    return res.redirect(
     `${process.env.BASE_URL}/auth-success?token=${accessToken}`
    );

  } catch (error) {
    next(error);
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// http://localhost:5000/api/auth/google/callback?iss=https%3A%2F%2Faccounts.google.com&code=4%2F0AXEQxIBGooV2pYfcBmZJozFQvSI34UYalPWOg4A1jE4gJR_iasEGcTj6r_MrJeELqrBH6A&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+openid&authuser=1&prompt=consent