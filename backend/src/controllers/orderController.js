
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const isValidId = (id) =>
  mongoose.isObjectIdOrHexString(id);


const validateProductsAndCalculateTotal = async (productIds) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return { error: 'At least one product is required' };
  }

  if (!productIds.every(isValidId)) {
    return { error: 'One or more product IDs are invalid' };
  }

  const uniqueIds = [...new Set(productIds)];

  const products = await Product.find({
    _id: { $in: uniqueIds },
  });

  const productsById = new Map(
    products.map((product) => [
      product._id.toString(),
      product,
    ])
  );

  if (productsById.size !== uniqueIds.length) {
    return { error: 'One or more products were not found' };
  }

  const total = productIds.reduce((sum, id) => {
    return sum + productsById.get(id).price;
  }, 0);

  return {
    productIds: productIds.map((id) =>
      new mongoose.Types.ObjectId(id)
    ),
    totalAmount: Number(total.toFixed(2)),
  };
};

// POST create a new order
const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productIds } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).json({
        message: 'Authenticated user no longer exists',
      });
    }

    const result = await validateProductsAndCalculateTotal(
      productIds
    );

    if (result.error) {
      return res.status(400).json({
        message: result.error,
      });
    }

    const order = await Order.create({
      userId,
      productIds: result.productIds,
      totalAmount: result.totalAmount,
    });

    return res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error.message);

    return res.status(500).json({
      message: 'Unable to create order',
    });
  }
};

// GET order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findOne({
      orderId: id,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Get order error:', error.message);

    return res.status(500).json({
      message: 'Unable to retrieve order',
    });
  }
};

// PUT update an existing order
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: 'Invalid order ID',
      });
    }

    const existingOrder = await Order.findOne({
      orderId: id,
      userId: req.user.userId,
    });

    if (!existingOrder) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    const { productIds } = req.body;

    const result = await validateProductsAndCalculateTotal(
      productIds
    );

    if (result.error) {
      return res.status(400).json({
        message: result.error,
      });
    }

    existingOrder.productIds = result.productIds;
    existingOrder.totalAmount = result.totalAmount;

    await existingOrder.save();

    return res.status(200).json({
      message: 'Order updated successfully',
      order: existingOrder,
    });
  } catch (error) {
    console.error('Update order error:', error.message);

    return res.status(500).json({
      message: 'Unable to update order',
    });
  }
};

// DELETE delete an order by ID
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findOneAndDelete({
      orderId: id,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Delete order error:', error.message);

    return res.status(500).json({
      message: 'Unable to delete order',
    });
  }
};

async function getOrders(req, res) {
  try {
    const orders = await Order.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);

    return res.status(500).json({
      message: 'Failed to retrieve orders.',
    });
  }
}

module.exports = {
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrders
};
