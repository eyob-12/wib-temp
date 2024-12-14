const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, default: 1 },
    selectedColor: { type: String, required: true },
    selectedSize: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
