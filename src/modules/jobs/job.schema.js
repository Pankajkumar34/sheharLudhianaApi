const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    location: {
      type: String,
      default: "",
    },

    jobType: {
      type: String,
      enum: [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
        "REMOTE",
        "HYBRID",
      ],
      required: true,
    },

    experience: {
      min: {
        type: Number,
        default: 0,
      },

      max: {
        type: Number,
        default: 0,
      },
    },

    salary: {
      min: {
        type: Number,
        default: 0,
      },

      max: {
        type: Number,
        default: 0,
      },
    },

    vacancies: {
      type: Number,
      default: 1,
    },

    applicationDeadline: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({
  title: "text",
  description: "text",
  skills: "text",
});

module.exports = mongoose.model("Job", jobSchema);