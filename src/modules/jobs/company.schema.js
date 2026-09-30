const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        companyName: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true,
        },

        logo: {
            type: String,
            default: "",
        },

        coverImage: {
            type: String,
            default: "",
        },

        jobCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobCategory",
            required: true,
            index: true,
        },
        description: {
            type: String,
            default: "",
        },

        website: {
            type: String,
            default: "",
        },

        email: {
            type: String,
            default: "",
        },

        phoneNumber: {
            type: String,
            default: "",
        },

        companySize: {
            type: String,
            enum: [
                "1-10",
                "11-50",
                "51-200",
                "201-500",
                "501-1000",
                "1000+",
            ],
            default: "1-10",
        },

        foundedYear: {
            type: Number,
        },

        address: {
            type: String,
            default: "",
        },

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

        socialLinks: {
            linkedin: {
                type: String,
                default: "",
            },

            instagram: {
                type: String,
                default: "",
            },

            facebook: {
                type: String,
                default: "",
            },

            twitter: {
                type: String,
                default: "",
            },
        },
       

        isActive: {
            type: Boolean,
            default: true,
            index: true,
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
    "CompanyProfile",
    companyProfileSchema
);