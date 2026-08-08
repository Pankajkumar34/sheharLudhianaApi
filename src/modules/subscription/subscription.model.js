const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    razorpayPlanId: String,
    razorpaySubscriptionId: String,
    razorpayCustomerId: String,
    razorpayPaymentId: String,

    plan: {
        type: String,
        enum: ["TRIAL", "REGULAR", "PREMIUM"],
        required: true
    },

    billingCycle: {
        type: String,
        enum: ["MONTHLY", "YEARLY"],
        default: "MONTHLY"
    },

    amount: Number,

    status: {
        type: String,
        enum: [
            "CREATED",
            "AUTHENTICATED",
            "ACTIVE",
            "PENDING",
            "HALTED",
            "CANCELLED",
            "EXPIRED"
        ],
        default: "CREATED"
    },

    autoRenew: {
        type: Boolean,
        default: true
    },

    currentStart: Date,
    currentEnd: Date,
    nextBillingAt: Date,

    cancelledAt: Date

},{
    timestamps:true
});

moudle.exports= mongoose.model("Subscription",subscriptionSchema)