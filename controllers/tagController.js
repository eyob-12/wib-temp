const Tag = require("../models/Tag.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId.js");
const ActivityLog = require("../models/Activity");


  

const createTag = asyncHandler(async (req, res) => {
    try {
        const newTag = await Tag.create(req.body);
        await ActivityLog.create({
            action: "Create Tag",
            resource: "Tag",
            resourceId: newTag._id,
            user: newTag.PostedByuserId,
            details: { newTag },
        });
        res.json(newTag);
    } catch (error) {
        throw new Error(error);
    }
});
const updateTag = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedTag = await Tag.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        await ActivityLog.create({
            action: "Update Tag",
            resource: "Tag",
            resourceId: updatedTag._id,
            user: updatedTag.PostedByuserId,
            details: { updatedTag },
        })
        res.json(updatedTag);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteTag = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedTag = await Tag.findByIdAndDelete(id);
        await ActivityLog.create({
            action: "Delete Tag",
            resource: "Tag",
            resourceId: deletedTag._id,
            user: deletedTag.PostedByuserId,
            details: { deletedTag },
        })
        res.json(deletedTag);
    } catch (error) {
        throw new Error(error);
    }
});
const getTag = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaTag = await Tag.findById(id);
        res.json(getaTag);
    } catch (error) {
        throw new Error(error);
    }
});
const getallTag = asyncHandler(async (req, res) => {
    try {
        const getallTag = await Tag.find();
        res.json(getallTag);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createTag,
    updateTag,
    deleteTag,
    getTag,
    getallTag,
};