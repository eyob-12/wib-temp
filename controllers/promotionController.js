const Discount = require("../models/promotion");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");
const ActivityLog = require("../models/Activity");
const createPromotion = asyncHandler(async (req, res) => {
    try {
        const { code, discountType, amount, expirationDate, minOrderAmount, maxDiscountAmount, productIds, createdBy } = req.body;

        // Check if a discount with the same code already exists
        const existingDiscount = await Discount.findOne({ code });
        if (existingDiscount) {
            return res.status(400).json({ message: "Discount code already exists" });
        }

        const newPromotion = await Discount.create({
            code,
            discountType,
            amount,
            expirationDate,
            minOrderAmount,
            maxDiscountAmount,
            productIds,
            createdBy,
        });

        await ActivityLog.create({
            action: "create Promotion",
            resource: "Promotion",
            resourceId: newPromotion._id,
           
            user: newPromotion.PostedByuserId,
            details: { newPromotion },
        });

        res.status(201).json(newPromotion);
    } catch (error) {
        throw new Error(error);
    }
});

const updatePromotion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updatedPromotion = await Discount.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!updatedPromotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }
         
        await ActivityLog.create({
            action: "Update Promotion",
            resource: "Promotion",
            resourceId: updatedPromotion._id,
           
            user: updatedPromotion.PostedByuserId,
            details: { updatedPromotion },
        });
        res.json(updatedPromotion);
    } catch (error) {
        throw new Error(error);
    }
});

const getPromotionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const promotion = await Discount.findById(id).populate("productIds createdBy");

        if (!promotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }

        res.json(promotion);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllPromotions = asyncHandler(async (req, res) => {
    try {
        const promotions = await Discount.find({ active: true }).populate("productIds createdBy");

        res.json(promotions);
    } catch (error) {
        throw new Error(error);
    }
});

const deactivatePromotion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deactivatedPromotion = await Discount.findByIdAndUpdate(id, { active: false }, { new: true });
        
        if (!deactivatedPromotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }

        await ActivityLog.create({
            action: "deactivate Promotion",
            resource: "Promotion",
            resourceId: deactivatedPromotion._id,
           
            user: deactivatedPromotion.PostedByuserId,
            details: { deactivatedPromotion },
        });

        res.json(deactivatedPromotion);
    } catch (error) {
        throw new Error(error);
    }
});

const getPromotionsByProductId = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    validateMongoDbId(productId);

    try {
        const promotions = await Discount.find({ productIds: productId, active: true }).populate("createdBy");

        res.json(promotions);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createPromotion,
    updatePromotion,
    getPromotionById,
    getAllPromotions,
    deactivatePromotion,
    getPromotionsByProductId,
};
