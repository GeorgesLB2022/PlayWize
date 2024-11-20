const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      unitPrice: { type: Number, required: true }, // Unit price of the product
      quantity: { type: Number, required: true },
      itemDiscount: { type: Number, default: 0 }, // Discount on this specific item
    }
  ],
  cartDiscount: { type: Number, default: 0 }, // Discount on the entire cart
  totalPrice: { type: Number, default: 0 }, // Final price after discounts
},
{ timestamps: true });


module.exports = mongoose.model('Cart', CartSchema);
