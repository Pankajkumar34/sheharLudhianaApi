const mongoose = require("mongoose");

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    headline: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobCategory",
      },
    ],

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: {
      type: Number,
      default: 0,
    },

    experienceLevel: {
      type: String,
      enum: [
        "FRESHER",
        "JUNIOR",
        "MID_LEVEL",
        "SENIOR",
        "LEAD",
      ],
      default: "FRESHER",
    },

    currentCompany: {
      type: String,
      default: "",
    },

    currentSalary: {
      type: Number,
      default: 0,
    },

    expectedSalary: {
      min: {
        type: Number,
        default: 0,
      },

      max: {
        type: Number,
        default: 0,
      },
    },

    preferredJobTitle: [
      {
        type: String,
        trim: true,
      },
    ],

    preferredLocations: [
      {
        type: String,
        trim: true,
      },
    ],

    resume: {
      type: String,
      default: "",
    },

    portfolio: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    availability: {
      type: String,
      enum: [
        "IMMEDIATELY",
        "15_DAYS",
        "30_DAYS",
        "60_DAYS",
        "90_DAYS",
      ],
      default: "IMMEDIATELY",
    },

    isOpenToWork: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

candidateProfileSchema.index({
  skills: 1,
  categories: 1,
});

module.exports = mongoose.model(
  "CandidateProfile",
  candidateProfileSchema
);