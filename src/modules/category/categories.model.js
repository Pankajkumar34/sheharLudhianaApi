const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    icon: {
      name: {
        type: String, // e.g., "Utensils", "ShoppingBag", "Hospital"
        required: true,
      },
      url: {
        type: String, // Image URL if using SVG/PNG from CDN
        default: "",
      },
      bgColor: {
        type: String,
        default: "#EF4444",
      },
    },
    businessCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);