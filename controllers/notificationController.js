const Notification = require("../models/Notification.js");

const markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    try {
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Failed to mark notification as read", error });
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user._id,
        }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications", error });
    }
};

const clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user._id });
        res.status(200).json({ message: "Notifications cleared" });
    } catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(500).json({ message: "Failed to clear notifications", error });
    }
};

const addNotification = async (req, res) => {
    try {
        const notification = new Notification({
            userId: req.user._id,
            message: req.body.message,
            order: req.body.order, // Add order reference if applicable
        });
        console.log(notification);
        res.status(201).json(notification);
    } catch (error) {
        console.error("Error adding notification:", error);
        res.status(500).json({ message: "Failed to add notification", error });
    }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res) => {
    try {
        console.log(req.user.id);
        const notifications = await Notification.updateMany(
            { user: req.user.id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res
            .status(500)
            .json({ message: "Failed to mark notifications as read", error });
    }
};

module.exports = {
    markAsRead,
    getNotifications,
    clearNotifications,
    addNotification,
    markNotificationsAsRead,
};