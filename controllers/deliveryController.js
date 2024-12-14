const DeliveryAssignment = require('../models/DeliveryAssignment');
const Order = require('../models/Order');

// Fetch all orders assigned to the delivery boy
const getAssignedOrders = async (req, res) => {
    try {
        const orders = await DeliveryAssignment.find({ deliveryBoy: req.user._id }).populate('order');
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assigned orders', error });
    }
};

// Mark an order as delivered
const markOrderDelivered = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.deliveryBoy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        assignment.status = 'delivered';
        assignment.deliveredAt = Date.now();
        await assignment.save();

        res.status(200).json({ message: 'Order marked as delivered', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Error marking order as delivered', error });
    }
};

module.exports = {
    getAssignedOrders,
    markOrderDelivered,
};