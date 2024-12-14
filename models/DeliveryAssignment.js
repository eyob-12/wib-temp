const mongoose = require('mongoose');

const DeliveryAssignmentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'delivered'],
        default: 'pending',
    },
    assignedAt: {
        type: Date,
        default: Date.now,
    },
    deliveredAt: Date,
});

const DeliveryAssignment = mongoose.model('DeliveryAssignment', DeliveryAssignmentSchema);

module.exports = DeliveryAssignment;
