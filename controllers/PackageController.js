const Package = require("../models/Package.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId.js");
const ActivityLog = require("../models/Activity");

const createPackage = asyncHandler(async (req, res) => {
    try {
        console.log(req.body)
        const newPackage = await Package.create(req.body);
       
        await ActivityLog.create({
            action: "Create Package",
            resource: "Package",
            resourceId: newPackage._id,
            user: newPackage.createdByUserId,
            details: { newPackage },
        });
        res.json(newPackage);
    } catch (error) {
        throw new Error(error);
    }
});

const updatePackage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(id)
    validateMongoDbId(id);
    try {
        const updatedPackage = await Package.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        await ActivityLog.create({
            action: "Update Package",
            resource: "Package",
            resourceId: updatedPackage._id,
            user: updatedPackage.createdByUserId,
            details: { updatedPackage },
        });

        res.json(updatedPackage);
    } catch (error) {
        throw new Error(error);
    }
});

const deletePackage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedPackage = await Package.findByIdAndDelete(id);
        await ActivityLog.create({
            action: "Delete Package",
            resource: "Package",
            resourceId: deletedPackage._id,
            user: deletedPackage.createdByUserId,
            details: { deletedPackage },
        });
        res.json(deletedPackage);
    } catch (error) {
        throw new Error(error);
    }
});

const getPackage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const packageData = await Package.findById(id);
        res.json(packageData);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllPackages = asyncHandler(async (req, res) => {
    try {
        const packages = await Package.find();
        res.json(packages);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createPackage,
    updatePackage,
    deletePackage,
    getPackage,
    getAllPackages,
};
