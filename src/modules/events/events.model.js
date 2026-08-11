const mongoose = require("mongoose");


const chiefGuestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Chief guest name is required"],
      trim: true,
    },

    designation: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);



const eventImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);


const eventSchema = new mongoose.Schema(
  {


    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },



    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [
        200,
        "Event title cannot exceed 200 characters",
      ],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },



    chiefGuest: {
      type: [chiefGuestSchema],
      default: [],
    },


    imageUrl: {
      type: [eventImageSchema],
      default: [],
    },



    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
      index: true,
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },

    endTime: {
      type: String,
      default: "",
      trim: true,
    },

 

    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    district: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },



    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },

      coordinates: {
        type: [Number],
        required: [
          true,
          "Location coordinates are required",
        ],

        validate: {
          validator: function (value) {
            if (!Array.isArray(value)) {
              return false;
            }

            if (value.length !== 2) {
              return false;
            }

            const [longitude, latitude] = value;

            return (
              Number.isFinite(longitude) &&
              Number.isFinite(latitude) &&
              longitude >= -180 &&
              longitude <= 180 &&
              latitude >= -90 &&
              latitude <= 90
            );
          },

          message:
            "Coordinates must be [longitude, latitude] with valid values",
        },
      },
    },



    eventType: {
      type: String,

      enum: [
        "MEETING",
        "RALLY",
        "SEMINAR",
        "CONFERENCE",
        "TRAINING",
        "SOCIAL",
        "CULTURAL",
        "OTHER",
      ],

      default: "OTHER",

      index: true,
    },



    maxParticipants: {
      type: Number,
      default: 0,
      min: [
        0,
        "Maximum participants cannot be negative",
      ],
    },

    registrationRequired: {
      type: Boolean,
      default: false,
      index: true,
    },

   

    status: {
      type: String,

      enum: [
        "UPCOMING",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
      ],

      default: "UPCOMING",

      index: true,
    },

  

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);



eventSchema.index({
  location: "2dsphere",
});


eventSchema.index({
  eventDate: 1,
  status: 1,
  isActive: 1,
});



eventSchema.index({
  state: 1,
  district: 1,
});


eventSchema.index({
  eventType: 1,
  eventDate: 1,
});



module.exports = mongoose.model(
  "Event",
  eventSchema
);