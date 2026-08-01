const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    
  {
    isProfileCompleted:{type:Boolean,default:false},
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "USER",
        "BUSINESS_OWNER",
        "ADMIN",
        "SUPER_ADMIN",
      ],
      default: "USER",
    },

    businessCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    socialLogin: {
      provider: {
        type: String,
        enum: ["local", "google", "github", "facebook", "apple"],
        default: "local",
      },
      socialId: {
        type: String,
        default: null,
      },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },

    otp: {
      code: String,
      expiresAt: Date,
      purpose: {
        type: String,
        enum: [
          "EMAIL_VERIFICATION",
          "PASSWORD_RESET",
          "LOGIN",
        ],
      },
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED", "PENDING"],
      default: "ACTIVE",
    },

    lastLogin: Date,

    address: {
      city: String,
      state: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash Password
// Hash Password
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);