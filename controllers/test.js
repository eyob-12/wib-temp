const Order = require('../models/orderModel');
const User = require('../models/userModel'); // Assuming delivery boy is a user

// Assign delivery boy to order
const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryBoyId } = req.body; // Delivery boy's ID from request body

    // Find the delivery boy
    const deliveryBoy = await User.findById(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }

    // Update the order with the delivery boy assignment
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        deliveryBoy: deliveryBoyId,
        orderStatus: 'Assigned', // Update order status to "Assigned"
      },
      { new: true } // Return the updated order
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Delivery boy assigned successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  assignDeliveryBoy,
};
