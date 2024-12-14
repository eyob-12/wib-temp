const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        issueType: {
            type: String,
            enum: [
                "bug", 
                "feature_request", 
                "enhancement", 
                "transaction_issue", 
                "product_approval", 
                "account_access", 
                "shipping_tracking", 
                "return_refund", 
                "promotions_discounts", 
                "technical_issue", 
                "other"
            ],
            required: [true, "Issue Type is required"],
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            required: [true, "Priority is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address"
            ],
        },
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin", "moderator"], 
            required: true,
        },
        status: {
            type: String,
            enum: ["open", "in_progress", "closed"],
            default: "open",
        },
    },
    {
        timestamps: true, 
    }
);

module.exports = mongoose.model("Report", reportSchema);
