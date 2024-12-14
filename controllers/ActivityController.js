// controllers/activityController.js
const ActivityLog = require('../models/Activity');
const asyncHandler = require("express-async-handler");
const User = require("../models/User");



// Function to log activity
const logActivity = async (userId, action, resource, resourceId, details = '') => {
  const log = new ActivityLog({
    userId,
    action,
    resource,
    resourceId,
    details,
  });

  try {
    await log.save();
    console.log('Activity logged successfully');
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};



const getallAdminActivity = asyncHandler(async (req, res) => {
  try {
      const getallAdminActivity = await ActivityLog.find();

      res.json(getallAdminActivity);
  } catch (error) {
      throw new Error(error);
  }
});

const getAllActivityByRole = asyncHandler(async (req, res) => {
  try {
    const { role } = req.params;

    if (!role) {
      return res.status(400).json({ message: "Role parameter is required." });
    }

    // Fetch users by role
    const users = await User.find({ role: role });
    if (!users.length) {
      return res.status(404).json({ message: `No users found with role: ${role}` });
    }

    const userIds = users.map((user) => user._id);

    // Fetch activities for the users
    const activities = await ActivityLog.find({ user: { $in: userIds } });

    if (!activities.length) {
      return res.status(404).json({ message: `No activities found for role: ${role}` });
    }

    const populatedActivities = await Promise.all(
      activities.map(async (activity) => {
        if (activity.details && activity.details.store) {
          const populatedActivity = await activity
            .populate({
              path: 'details.store',
              select: 'storeName', 
            })
            .execPopulate();

          return populatedActivity;
        } else {
          // If no store in details, return the activity as is
          return activity;
        }
      })
    );

    res.json(populatedActivities);
  } catch (error) {
    res.status(500).json({
      message: `Error fetching activities for role ${role}: ${error.message}`,
    });
  }
});




// Get all activity logs for an admin user
const getAdminActivity = async (req, res) => {
  const { id } = req.params;
  console.log(id)

  try {
    const activityLogs = await ActivityLog.find({ 
        user: id })
      .sort({ timestamp: -1 })
      .limit(10);
    if (!activityLogs.length) {
      return res.status(404).json({ message: 'No activity found for this admin' });
    }

    res.status(200).json({ activityLogs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity logs' });
  }
};


// Get all activity logs 
const getAllActivity = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .populate("user", "firstname");
    for (let log of activityLogs) {
      if (log.resource === "Product") {
        await log.populate({
          path: "details.newProduct.colors.color",
          select: "title", 
        });
      }
    }

    if (activityLogs.length === 0) {
      return res.status(404).json({ message: 'No activity found for this admin' });
    }

    res.status(200).json({ activityLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
  }
};


const getEachActivity = async (req, res) => {
  const { id } = req.params;
  console.log(id)

  try {
    const activityLogs = await ActivityLog.find({_id:id})
      .populate("user", "firstname")  
    if (!activityLogs.length) {
      return res.status(404).json({ message: 'No activity found ' });
    }

    res.status(200).json({ activityLogs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity logs' });
  }
};

const updateActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { Isread } = req.body;

    if (typeof Isread !== "boolean") {
      return res.status(400).json({ message: "Invalid value for Isread. It must be a boolean." });
    }
    const updatedActivity = await ActivityLog.findByIdAndUpdate(
      id,
      { Isread },
      { new: true }
    );
    if (!updatedActivity) {
      return res.status(404).json({ message: "Activity log not found." });
    }
    res.status(200).json({ message: "Activity updated successfully.", data: updatedActivity });
  } catch (error) {
    console.error("Error updating activity log:", error.message);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Get all activity logs 
const getUnreadActivity = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find({Isread: false})
      .sort({ timestamp: -1 })
      .populate("user", "firstname");
    for (let log of activityLogs) {
      if (log.resource === "Product") {
        await log.populate({
          path: "details.newProduct.colors.color",
          select: "title", 
        });
      }
    }

    if (activityLogs.length === 0) {
      return res.status(202).json({ message: 'No activity found for this' });
    }

    res.status(200).json({ activityLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
  }
};


module.exports = { logActivity,getAllActivityByRole,getEachActivity, getAdminActivity, getallAdminActivity,getAllActivity,updateActivityLog,getUnreadActivity};
