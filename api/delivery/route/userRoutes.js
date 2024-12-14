const express = require("express");
const {
  createUser,
  getDeliveryBoys,
  getAssignedOrders,
  updateDeliveryBoy,
  deleteDeliveryBoy,
  updateOrderStatus
} = require("../controler/userController");
const { authMiddleware, isAdmin,isDeliveryBoy } = require("../../../middlewares/authMiddleware");
const router = express.Router();

// Admin routes
router.post("/users", authMiddleware, isAdmin, createUser); // Create user (admin can create delivery boys)
router.get("/delivery-boys", authMiddleware, isAdmin, getDeliveryBoys); // Get all delivery boys
router.put("/delivery-boys/:id", authMiddleware, isAdmin, updateDeliveryBoy); // Update delivery boy
router.delete("/delivery-boys/:id", authMiddleware, isAdmin, deleteDeliveryBoy); // Delete delivery boy
router.get("/assigned/:deliveryPersonId", getAssignedOrders);
router.put("/order/:orderId/status", updateOrderStatus);

module.exports = router;
