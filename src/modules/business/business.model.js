const mongoose = require("mongoose")
const businessSchema = new mongoose.Schema(

  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [50, "Description must be at least 50 characters"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    whatsapp: {
      type: String,
      match: [/^\d{10}$/, "Please enter a valid 10-digit whatsapp number"],
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    keywords: [String],
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
    },
    hours: [
      {
        day: {
          type: String,
          required: true,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        open: {
          type: Boolean,
          default: false,
        },
        from: {
          type: String,
          default: "09:00",
        },
        to: {
          type: String,
          default: "18:00",
        },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    photos: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String, // Cloudinary/S3 ID
          default: "",
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);
businessSchema.index({ location: "2dsphere" });
module.exports = new mongoose.model("Business", businessSchema)