const Category = require("../models/BlogCategory");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");
const ActivityLog = require("../models/Activity");
const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        // Activity log for category creation
        await ActivityLog.create({
            action: "create Blog Category",
            resource: "BlogCategory",
            resourceId: newCategory._id,
            user: newCategory.PostedByuserId,
            details: { newCategory},
        });

        res.json(newCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        
        // Activity log for category update
        await ActivityLog.create({
            action: "update Category",
            resource: "BlogCategory",
            resourceId: updatedCategory._id,
            user: updatedCategory.PostedByuserId,
            details: { updatedCategory },
        });

        res.json(updatedCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);

        // Activity log for category deletion
        await ActivityLog.create({
            action: "Delete BlogCategory",
            resource: "BlogCategory",
            resourceId: deletedCategory._id,
            user:  deletedCategory.PostedByuserId,
            details: { deletedCategory },
        });
        res.json(deletedCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaCategory = await Category.findById(id);

        
        res.json(getaCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const getallCategory = asyncHandler(async (req, res) => {
    try {
        const getallCategory = await Category.find();
        res.json(getallCategory);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getallCategory,
};