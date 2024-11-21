const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');

// Add a new coupon
const addCoupon = asyncHandler(async (req, res, next) => {
    try {
      // Helper function to generate a random coupon code
      const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };
  
      const {
        discountPercentage,
        validUntil,
        usageLimit,
        user // Optional user ID
      } = req.body;
  
      if (!discountPercentage || !validUntil) {
        return res.status(400).json({
          success: false,
          message: 'Discount percentage and validUntil are required.'
        });
      }
  
      // Automatically set a unique code
      let code = generateCouponCode();
      let isUnique = false;
  
      // Ensure the generated code is unique
      while (!isUnique) {
        const existingCoupon = await Coupon.findOne({ code });
        if (!existingCoupon) {
          isUnique = true;
        } else {
          code = generateCouponCode(); // Regenerate code if it already exists
        }
      }
  
      // Create the coupon
      const newCoupon = await Coupon.create({
        code,
        discountPercentage,
        validUntil,
        usageLimit,
        user: user || null // Assign user if provided
      });
  
      res.status(201).json({
        success: true,
        message: 'Coupon created successfully.',
        coupon: newCoupon
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
  
        return res.status(400).json({
          success: false,
          message: 'Validation error occurred.',
          errors: validationErrors
        });
      }
      next(error);
    }
  });

// Get all coupons
const getAllCoupons = asyncHandler(async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({
      success: true,
      message: 'Coupons retrieved successfully.',
      coupons,
    });
  } catch (error) {
    next(error);
  }
});

// Get a coupon by ID
const getCouponById = asyncHandler(async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Coupon retrieved successfully.',
      coupon,
    });
  } catch (error) {
    next(error);
  }
});

// Update a coupon
const updateCoupon = asyncHandler(async (req, res, next) => {
  const { code, discountPercentage, validUntil, usageLimit } = req.body;

  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      throw error;
    }

    // Update fields
    coupon.code = code || coupon.code;
    coupon.discountPercentage =
      discountPercentage || coupon.discountPercentage;
    coupon.validUntil = validUntil || coupon.validUntil;
    coupon.usageLimit = usageLimit || coupon.usageLimit;

    const updatedCoupon = await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon: updatedCoupon,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error occurred.',
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code must be unique.',
      });
    }

    next(error);
  }
});

// Delete a coupon
const deleteCoupon = asyncHandler(async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// Apply a coupon
const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code is required.',
    });
  }

  try {
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code.',
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached.',
      });
    }

    if (new Date() > new Date(coupon.validUntil)) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully.',
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    next(error);
  }
});

// Export controllers
module.exports = {
  addCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
