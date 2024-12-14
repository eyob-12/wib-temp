const Size = require("../models/Size.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId.js");
const ActivityLog = require("../models/Activity");


const createSize = asyncHandler(async (req, res) => {
    try {
        const newSize = await Size.create(req.body);

        await ActivityLog.create({
            action: "create Size",
            resource: "Size",
            resourceId: newSize._id,
            user: newSize.owner_id, 
            details: { newSize },
        });
        res.json(newSize);
    } catch (error) {
        throw new Error(error);
    }
});
const updateSize = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedSize = await Size.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        await ActivityLog.create({
            action: "Update Size",
            resource: "Size",
            resourceId: updatedSize._id,
            user: updatedSize.owner_id, 
            details: {updatedSize },
        });
        res.json(updatedSize);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteSize = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedSize = await Size.findByIdAndDelete(id);

        await ActivityLog.create({
            action: "Delete Size",
            resource: "Size",
            resourceId: deletedSize._id,
            user: deletedSize.owner_id, 
            details: {deletedSize },
        });
        res.json(deletedSize);
    } catch (error) {
        throw new Error(error);
    }
});
const getSize = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaSize = await Size.findById(id);
        res.json(getaSize);
    } catch (error) {
        throw new Error(error);
    }
});
const getallSize = asyncHandler(async (req, res) => {
    try {
        const getallSize = await Size.find();
        res.json(getallSize);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createSize,
    updateSize,
    deleteSize,
    getSize,
    getallSize,
};