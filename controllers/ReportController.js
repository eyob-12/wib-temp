const Report = require("../models/Report");  // Assuming there's a Report model
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");
const ActivityLog = require("../models/Activity");

const createReport = asyncHandler(async (req, res) => {
    try {
        const newReport = await Report.create(req.body);
        await ActivityLog.create({
            action: "create Report",
            resource: "Repoert on issue",
            resourceId: newReport._id,
            user: newReport.PostedByuserId,
            details: { newReport },
        })
        res.json(newReport);
    } catch (error) {
        throw new Error(error);
    }
});


const updateReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedReport = await Report.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        await ActivityLog.create({
            action: "Update Report",
            resource: "Repoert on issue",
            resourceId: updatedReport._id,
            user: updatedReport.PostedByuserId,
            details: { updatedReport },
        })
        res.json(updatedReport);
    } catch (error) {
        throw new Error(error);
    }
});


const updateReportStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        if (!req.body.status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            id,
            { status: req.body.status },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: "Report not found" });
        }
        await ActivityLog.create({
            action: "Update Report Status",
            resource: "Repoert on issue",
            resourceId: updatedReport._id,
            user: updatedReport.PostedByuserId,
            details: { updatedReport },
        })

        res.json(updatedReport);
    } catch (error) {
        throw new Error(error);
    }
});


const deleteReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedReport = await Report.findByIdAndDelete(id);
        await ActivityLog.create({
            action: "Delete Report",
            resource: "Repoert on issue",
            resourceId: deletedReport._id,
            user: deletedReport.PostedByuserId,
            details: { deletedReport },
        })
        res.json(deletedReport);
    } catch (error) {
        throw new Error(error);
    }
});


const getReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.json(report);
    } catch (error) {
        throw new Error(error);
    }
});


const getAllReports = asyncHandler(async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let query = Report.find(JSON.parse(queryStr));

        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numReports = await Report.countDocuments();
            if (skip >= numReports) throw new Error("This page does not exist");
        }
        
        const reports = await query;
        res.json(reports);
    } catch (error) {
        throw new Error(error);
    }
});
const toggleFavoriteReport = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { reportId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyFavorite = user.favoriteReports.find((id) => id.toString() === reportId);
        if (alreadyFavorite) {
            let updatedUser = await User.findByIdAndUpdate(
                _id,
                { $pull: { favoriteReports: reportId } },
                { new: true }
            );
            res.json(updatedUser);
        } else {
            let updatedUser = await User.findByIdAndUpdate(
                _id,
                { $push: { favoriteReports: reportId } },
                { new: true }
            );
            res.json(updatedUser);
        }
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createReport,
    updateReport,
    updateReportStatus,
    deleteReport,
    getReport,
    getAllReports,
    toggleFavoriteReport
};

