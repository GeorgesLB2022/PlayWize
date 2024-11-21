const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');

// Create a new order
const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const { user, products, totalAmount, status } = req.body;

    // Validate required fields
    if (!user || !products || products.length === 0 || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user, products, or totalAmount.',
      });
    }

    // Create the order
    const order = new Order({ user, products, totalAmount, status });
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error occurred.',
        errors: validationErrors,
      });
    }
    next(error);
  }
});

// Get an order by ID
const getOrderById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'name email') // Populate user details
      .populate('products.product', 'name price'); // Populate product details

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
});

// Update an order's status
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
});

// Get all orders for a user
const getUserOrders = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .populate('products.product', 'name price')
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No orders found for this user.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully.',
      orders,
    });
  } catch (error) {
    next(error);
  }
});

// Delete an order
const deleteOrder = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// Get all orders (admin functionality)
const getAllOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'All orders retrieved successfully.',
      orders,
    });
  } catch (error) {
    next(error);
  }
});

// Controller to get orders by status
const getOrdersByStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.params;

    try {
        // Validate the status parameter
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
            });
        }

        // Find orders matching the status
        const orders = await Order.find({ status })
            .populate('user', 'name email') // Populate user details (optional)
            .populate('products.product', 'name price'); // Populate product details (optional)

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        next(error);
    }
});

// Controller to get recent orders
const getRecentOrders = asyncHandler(async (req, res, next) => {
    try {
        // Limit the number of recent orders retrieved
        const limit = parseInt(req.query.limit) || 10;

        const orders = await Order.find()
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .limit(limit)
            .populate('user', 'name email') // Populate user details (optional)
            .populate('products.product', 'name price'); // Populate product details (optional)

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  deleteOrder,
  getAllOrders,
  getOrdersByStatus,
  getRecentOrders
};
