const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  price: { 
    type: Number, 
    required: true, 
    validate: {
      validator: function(value) {
        return value >= 0; // Custom validation: price should not be negative
      },
      message: 'Price cannot be negative' // Error message if validation fails
    }
  },
  currency: { type: String, required: true, default: 'USD' }, // Added currency field with default
  stock: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Added discount field with default of 0
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: false }, // Added warehouse reference
  images: [{ type: String }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
}, 
{ timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);

