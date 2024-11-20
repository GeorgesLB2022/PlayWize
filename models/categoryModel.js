const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }, // Optional
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // For subcategories
  
}, 
{ timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
