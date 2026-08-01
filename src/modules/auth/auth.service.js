const User = require("../user/user.model");
const { generateToken } = require("../../utils/jwt");


exports.signup = async (body) => {
  const { fullName, email, phone, password } = body;

  // Check email
  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new Error("Email already exists.");
    }
  }

  // Check phone
  if (phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      throw new Error("Phone number already exists.");
    }
  }

  const user = await User.create({
    fullName,
    email,
    phone,
    password,

    // Optional (schema me defaults bhi hain)
    role: "USER",
    status: "ACTIVE",

    socialLogin: {
      provider: "local",
      socialId: null,
    },

    isEmailVerified: false,
    isPhoneVerified: false,
  });

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
    },
    token,
  };
};

exports.login = async (body) => {

    const {
        email,
        password
    } = body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Error("Invalid credentials.");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new Error("Invalid credentials.");
    }

    const token = generateToken(user._id);

    user.password = undefined;

    return {
        user,
        token,
    };
};



exports.socialLogin = async (user) => {
  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
    },
  };
};