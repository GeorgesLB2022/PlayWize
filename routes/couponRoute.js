const express = require('express');
const router = express.Router();
const {
  addCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} = require('../controllers/couponController');

// Routes
router.post('/', addCoupon);
router.get('/', getAllCoupons);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);
router.post('/apply', applyCoupon);

module.exports = router;
