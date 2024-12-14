const Enquiry = require("../models/FQA");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createEnquiry = asyncHandler(async (req, res) => {
    try {
        const newEnquiry = await Enquiry.create(req.body);

        await Activity.create({
            action: "create Enquiry",
            resource: "Enquiry",
            resourceId:  newEnquiry._id,
            user: c.PostedByuserId,
            details: {  newEnquiry : req.body },
        });
        res.json(newEnquiry);
    } catch (error) {
        throw new Error(error);
    }
});
const updateEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        await Activity.create({
            action: "Update Enquiry",
            resource: "Enquiry",
            resourceId:  updatedEnquiry._id,
            user: updatedEnquiry.PostedByuserId,
            details: {  updatedEnquiry : req.body },
        });
        res.json(updatedEnquiry);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedEnquiry = await Enquiry.findByIdAndDelete(id);

        
        await Activity.create({
            action: "Delete  Enquiry",
            resource: "Enquiry",
            resourceId:  deletedEnquiry._id,
            user: deletedEnquiry.PostedByuserId,
            details: {  deletedEnquiry : req.body },
        });
        res.json(deletedEnquiry);
    } catch (error) {
        throw new Error(error);
    }
});
const getEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaEnquiry = await Enquiry.findById(id);
        res.json(getaEnquiry);
    } catch (error) {
        throw new Error(error);
    }
});
const getallEnquiry = asyncHandler(async (req, res) => {
    try {
        const getallEnquiry = await Enquiry.find();
        res.json(getallEnquiry);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    getEnquiry,
    getallEnquiry,
};