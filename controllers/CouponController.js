const Coupon = require("../models/Coupon");
const validateMongoDbId = require("../utils/validateMongoDbId");
const asynHandler = require("express-async-handler");
const Activity = require("../models/Activity"); 

const createCoupon = asynHandler(async (req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body);

        await Activity.create({
            action: "create Coupon",
            resource: "Coupon",
            resourceId: newCoupon._id,
           
            user: newCoupon.PostedByuserId,
            details: { newCoupon: req.body },
        });
        res.json(newCoupon);
    } catch (error) {
        throw new Error(error);
    }
});
const getAllCoupons = asynHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        throw new Error(error);
    }
});
const updateCoupon = asynHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatecoupon = await Coupon.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        await Activity.create({
            action: "update Coupon",
            resource: "Coupon",
            resourceId: updatecoupon._id,
            user: updatecoupon.PostedByuserId,
            details: { updatecoupon: req.body },
        });

        res.json(updatecoupon);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteCoupon = asynHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletecoupon = await Coupon.findByIdAndDelete(id);

        await Activity.create({
            action: "Delete Coupon",
            resource: "Coupon",
            resourceId: deletecoupon._id,
            user: deletecoupon.PostedByuserId,
            details: { deletecoupon: req.body },
        });
        res.json(deletecoupon);
    } catch (error) {
        throw new Error(error);
    }
});
const getCoupon = asynHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getAcoupon = await Coupon.findById(id);
        res.json(getAcoupon);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    getCoupon,
};