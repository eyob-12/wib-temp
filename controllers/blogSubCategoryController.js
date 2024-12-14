const Category = require("../models/BlogSubCategory.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId.js");
const ActivityLog = require("../models/Activity.js");

const createSubcategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        // Activity log for subcategory creation
        await ActivityLog.create({
            action: "create Subcategory",
            resource: "Blog Subcategory",
            resourceId: newCategory._id,
            user:  newCategory.PostedByuserId,
            details: { newCategory: req.body },
        });
        res.json(newCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const updateSubcategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
            new: true,
        });


        // Activity log for subcategory update
        await ActivityLog.create({
            action: "update Blog Subcategory",
            resource: "Blog Subcategory",
            resourceId: updatedCategory._id,
            user: updatedCategory.PostedByuserId,
            details: {
                updated: updatedCategory,
            },})
        res.json(updatedCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteSubcategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);

        // Activity log for subcategory deletion
        await ActivityLog.create({
            action: "delete Blog Subcategory",
            resource: "Blog Subcategory",
            resourceId: deletedCategory._id,
            user: req.user ? req.user._id : deletedCategory.PostedByuserId,
            details: { deletedCategory },
        });
        res.json(deletedCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const getSubcategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaCategory = await Category.findById(id);
        res.json(getaCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const getallSubcategory = asyncHandler(async (req, res) => {
    try {
        const getallCategory = await Category.find();
        res.json(getallCategory);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getSubcategory,
    getallSubcategory,
};