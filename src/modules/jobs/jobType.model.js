const mongoose = require("mongoose");

const jobTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Job type name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Job type name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    icon: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobTypeSchema.index({
  name: "text",
  description: "text",
});

jobTypeSchema.index({
  isActive: 1,
  sortOrder: 1,
});

module.exports = mongoose.model(
  "JobType",
  jobTypeSchema
);