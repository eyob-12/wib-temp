const Brand = require("../models/Brand");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");
const ActivityLog = require("../models/Activity");

const createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);


        await ActivityLog.create({
            action: "create Brand",
            resource: "Brand",
            resourceId: newBrand._id,
            user: newBrand.PostedByuserId,
            details: { brandData: req.body },
        });
        res.json(newBrand);
    } catch (error) {
        throw new Error(error);
    }
});

const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updateBrand = await Brand.findByIdAndUpdate(id, res.body, {
            new: true,
        });

        await ActivityLog.create({
            action: "Update Brand",
            resource: "Brand",
            resourceId: updateBrand._id,
            user: updateBrand.PostedByuserId,
            details: { updateBrand },
        });
        res.json(updateBrand);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteBrand = await Brand.findByIdAndDelete(id);
        await ActivityLog.create({
            action: "Delete Brand",
            resource: "Brand",
            resourceId: deleteBrand._id,
            user: deleteBrand.PostedByuserId,
            details: { deleteBrand},
        });

        res.json(deleteBrand);
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
});

const getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaBrand = await Brand.findById(id);
        res.json(getaBrand);
    } catch (error) {
        throw new Error(error);
    }
});

const getallBrand = asyncHandler(async (req, res) => {

    try {
        const getallBrand = await Brand.find();
        res.json(getallBrand);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getallBrand,
}