const mongoose = require("mongoose");

const influencerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InfluencerCategory",
      },
    ],

    location: {
      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "India",
      },
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    dateOfBirth: {
      type: Date,
    },

    socialMedia: {
      instagram: {
        username: String,
        url: String,
        followers: {
          type: Number,
          default: 0,
        },
      },

      youtube: {
        channel: String,
        url: String,
        subscribers: {
          type: Number,
          default: 0,
        },
      },

      facebook: {
        url: String,
        followers: {
          type: Number,
          default: 0,
        },
      },

      twitter: {
        username: String,
        url: String,
        followers: {
          type: Number,
          default: 0,
        },
      },
    },

    contentTypes: [
      {
        type: String,
        enum: [
          "REELS",
          "SHORTS",
          "VIDEOS",
          "POSTS",
          "STORIES",
          "LIVE",
          "BLOGS",
        ],
      },
    ],

    languages: [
      {
        type: String,
      },
    ],

    collaborationTypes: [
      {
        type: String,
        enum: [
          "PAID",
          "BARTER",
          "AFFILIATE",
          "BRAND_AMBASSADOR",
        ],
      },
    ],

    minimumCharge: {
      type: Number,
      default: 0,
    },

    portfolio: [
      {
        type: String,
      },
    ],

    isAvailableForCollaboration: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InfluencerProfile",
  influencerProfileSchema
);