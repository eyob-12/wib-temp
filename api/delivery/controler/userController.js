// controllers/userController.js
const User = require("../../../models/User");
const Order = require("../../../models/Order"); // Assuming you have an Order model
// Create User
const createUser = async (req, res) => {
  const { firstname, lastname, username, email, password, mobile, role } =
    req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User already exists." });

  const newUser = new User({
    firstname,
    lastname,
    email,
    password,
    mobile,
    role,
  });
  await newUser.save();

  res
    .status(201)
    .json({ success: true, message: "User created successfully." });
};

// Get All Delivery Boys
const getDeliveryBoys = async (req, res) => {
  res.set("Cache-Control", "no-store"); // Disable caching

  const deliveryBoys = await User.find({ role: "deliveryBoy" });
  res.status(200).json(deliveryBoys);
};

// Assign Order to Delivery Boy
const getAssignedOrders = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params; // Extract delivery person's ID from request parameters

    // Find orders assigned to the delivery person with 'assigned' or 'active' status
    const orders = await Order.find({
      assignedTo: deliveryPersonId,
      orderStatus: { $in: ["assigned", "active"] }, // Fetch both 'assigned' and 'active' orders
    })
    .populate("user", "first_name last_name email") // Populate user details
    .populate("cart.product", "name price"); // Populate product details

    if (orders.length === 0) {
      return res.status(404).json({ message: "No assigned or active orders found." });
    }

    // Respond with the assigned and active orders
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching assigned and active orders:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update Delivery Boy
const updateDeliveryBoy = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedDeliveryBoy = await User.findByIdAndUpdate(id, updates, {
    new: true,
  });
  res.status(200).json(updatedDeliveryBoy);
};

// Delete Delivery Boy
const deleteDeliveryBoy = async (req, res) => {
  const { id } = req.params;

  await User.findByIdAndDelete(id);
  res.status(204).json({ message: "Delivery boy deleted successfully." });
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    order.orderStatus = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createUser,
  getDeliveryBoys,
  getAssignedOrders,
  updateDeliveryBoy,
  deleteDeliveryBoy,
  updateOrderStatus
};
