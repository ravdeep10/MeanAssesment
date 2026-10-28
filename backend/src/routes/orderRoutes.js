const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const {
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrders
} = require("../controllers/orderController");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createOrder);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.get('/', getOrders);

module.exports = router;
