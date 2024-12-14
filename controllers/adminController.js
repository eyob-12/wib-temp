const DeliveryAssignment = require('../models/DeliveryAssignment');

exports.assignDeliveryBoy = async (req, res) => {
    try {
        const { orderId, deliveryBoyId } = req.body;
        const assignment = new DeliveryAssignment({
            order: orderId,
            deliveryBoy: deliveryBoyId,
        });
        await assignment.save();
        res.status(200).json({ message: 'Delivery boy assigned', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning delivery boy', error });
    }
};
