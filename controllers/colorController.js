const Color = require("../models/Color");
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require("../utils/validateMongoDbId");
const Activity = require("../models/Activity");

const createColor = asyncHandler(async (req, res) => {
    try {
        const newColor = await Color.create(req.body);
        await Activity.create({
            action: "create Color",
            resource: "Color",
            resourceId: newColor._id,
            user:  newColor.PostedByuserId,
            details: {newColor: req.body },
        });
        res.json(newColor);
    } catch (error) {
        throw new Error(error);
    }
});

const updateColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        
        await Activity.create({
            action: "Update Color",
            resource: "Color",
            resourceId: updatedColor._id,
            user:  updatedColor.PostedByuserId,
            details: {updatedColor: req.body },
        });
        res.json(updatedColor);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedColor = await Color.findByIdAndDelete(id);
        await Activity.create({
            action: "Delete Color",
            resource: "Color",
            resourceId: deletedColor._id,
            user:  deletedColor.PostedByuserId,
            details: {deletedColor: req.body },
        });
        res.json(deletedColor);
    } catch (error) {
        throw new Error(error);
    }
});
const getColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaColor = await Color.findById(id);
        res.json(getaColor);
    } catch (error) {
        throw new Error(error);
    }
});
const getColorsByIds = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    try {
        const colors = await Color.find({ _id: { $in: ids } });
        res.json(colors);
    } catch (error) {
        throw new Error(error);
    }
});
const getallColor = asyncHandler(async (req, res) => {
    try {
        const getallColor = await Color.find();
        res.json(getallColor);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createColor,
    updateColor,
    deleteColor,
    getColor,
    getallColor,
    getColorsByIds
};