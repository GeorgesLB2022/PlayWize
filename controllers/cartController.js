const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// 1. Add Item to Cart
const addItemToCart = asyncHandler(async (req, res, next) => {
  const { user, product, quantity } = req.body;

  if (!user || !product || !quantity) {
    const error = new Error('User, product, and quantity are required.');
    error.statusCode = 400;
    return next(error);
  }

  try {
    const productDetails = await Product.findById(product);
    if (!productDetails) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }

    let cart = await Cart.findOne({ user });

    if (!cart) {
      cart = new Cart({ user, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === product);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product,
        unitPrice: productDetails.price,
        quantity,
        itemDiscount: 0,
      });
    }

    // Update total price
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + (item.unitPrice - item.itemDiscount) * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully.',
      cart,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error occurred.',
        errors: validationErrors,
      });
    }

    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
});

// 2. Remove Item from Cart
const removeItemFromCart = asyncHandler(async (req, res, next) => {
  const { user, product } = req.body;

  if (!user || !product) {
    const error = new Error('User and product are required.');
    error.statusCode = 400;
    return next(error);
  }

  try {
    const cart = await Cart.findOne({ user });

    if (!cart) {
      const error = new Error('Cart not found.');
      error.statusCode = 404;
      throw error;
    }

    cart.items = cart.items.filter(item => item.product.toString() !== product);

    // Update total price
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + (item.unitPrice - item.itemDiscount) * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully.',
      cart,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error occurred.',
        errors: validationErrors,
      });
    }

    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
});

// 3. Update Item Quantity
const updateItemQuantity = asyncHandler(async (req, res, next) => {
  const { user, product, quantity } = req.body;

  if (!user || !product || typeof quantity !== 'number') {
    const error = new Error('User, product, and a valid quantity are required.');
    error.statusCode = 400;
    return next(error);
  }

  try {
    const cart = await Cart.findOne({ user });

    if (!cart) {
      const error = new Error('Cart not found.');
      error.statusCode = 404;
      throw error;
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === product);

    if (itemIndex === -1) {
      const error = new Error('Item not found in cart.');
      error.statusCode = 404;
      throw error;
    }

    cart.items[itemIndex].quantity = quantity;

    // Update total price
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + (item.unitPrice - item.itemDiscount) * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json({
      success: true,
      message: 'Item quantity updated successfully.',
      cart,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error occurred.',
        errors: validationErrors,
      });
    }

    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
});

// 4. Apply Cart Discount
const applyCartDiscount = asyncHandler(async (req, res, next) => {
  const { user, cartDiscount } = req.body;

  if (!user || typeof cartDiscount !== 'number') {
    const error = new Error('User and a valid cart discount are required.');
    error.statusCode = 400;
    return next(error);
  }

  try {
    const cart = await Cart.findOne({ user });

    if (!cart) {
      const error = new Error('Cart not found.');
      error.statusCode = 404;
      throw error;
    }

    cart.cartDiscount = cartDiscount;

    // Update total price
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + (item.unitPrice - item.itemDiscount) * item.quantity,
      0
    ) - cart.cartDiscount;

    await cart.save();
    res.status(200).json({
      success: true,
      message: 'Cart discount applied successfully.',
      cart,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error occurred.',
        errors: validationErrors,
      });
    }

    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
});

// 5. Get Cart
const getCart = asyncHandler(async (req, res, next) => {
    try {
      const { userId } = req.params;
  
      // Validate if the userId is provided
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required.',
        });
      }
  
      // Find the cart associated with the user
      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'name price images', // Include relevant fields from the product
      });
  
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found.',
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully.',
        cart,
      });
    } catch (error) {
      next(error);
    }
  });
  

// Export All Controllers
module.exports = {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  applyCartDiscount,
  getCart,
};
