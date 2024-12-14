const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a title for the package"],
            trim: true,
        },
        duration: {
            type: Number,
            required: [true, "Please provide a description for the package"],
        },
        amount: {
            type: Number,
            required: [true, "Please provide a price for the package"],
        },
        createdByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
