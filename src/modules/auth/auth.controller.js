
const jwt = require("../../utils/jwt");
const authService = require("./auth.service");
const otpCache = require("../../utils/nodeCache")
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

exports.sendOtp = async (req, res) => {
  try {
    let { phoneNumber, isLoginRoute } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Clean phone number
    phoneNumber = phoneNumber.toString().trim();

    if (phoneNumber.startsWith("91")) {
      phoneNumber = phoneNumber.slice(2);
    }

    const isValid = /^[6-9]\d{9}$/.test(phoneNumber);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "⚠️ दर्ज किया गया मोबाइल नंबर अमान्य है। कृपया सही मोबाइल नंबर दर्ज करें।",
      });
    }

    const existingUser = await User.findOne({ phoneNumber: String(phoneNumber) });
    // LOGIN
    if (isLoginRoute === true || isLoginRoute === "true") {
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "⚠️ आपने अभी तक पंजीकरण नहीं किया है। कृपया पहले अपना पंजीकरण करें।",
        });
      }
    }

    // REGISTER
    else {
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "⚠️ यह मोबाइल नंबर पहले से पंजीकृत है। कृपया सीधे अपने प्रोफ़ाइल में लॉगिन करें।",
        });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp)
    otpCache.set(String(phoneNumber), otp);
    // await sendOTP(phoneNumber, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });

  } catch (error) {
    console.error("Error sending OTP:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {

    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        error: "Phone number and OTP are required",
      });
    }

    const user = await User.findOne({
      phone:phoneNumber,
    });

    if (!user) {
      return res.status(404).json({
        error: "User Not Found In Db",
      });
    }

    // const cachedOtp = otpCache.get(String(phoneNumber))

    const cachedOtp = "1111";



    if (!cachedOtp) {
      return res.status(400).json({
        error: "OTP expired or not sent!",
      });
    }

    if (cachedOtp !== otp) {
      return res.status(400).json({
        error: "Invalid OTP! Login failed.",
      });
    }

    otpCache.del(phoneNumber);

    const accessToken = jwt.generateAccessToken(user._id);
    const refreshToken = jwt.generateRefreshToken(user._id);


    return res.status(200).json({
      message: "OTP Verified & User Logged successfully!",
      accessToken: accessToken,
      refreshToken: refreshToken,

      user: {
        id: user._id,
        fullName: user.fullName,
        imageUrl: user.profileImage,
        role: user.role,
        isProfileCompleted:user.isProfileCompleted,
        email:user.email
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      error: error.message,
      status: 500,
    });
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