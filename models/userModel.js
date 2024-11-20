const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: [
    {
      fullName: { type: String, required: false },
      street: { type: String, required: false },
      city: { type: String, required: true },
      state: { type: String, required: false },
      postalCode: { type: String, required: false },
      country: { type: String, required: true },
    }
  ],
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  isActive: {type: Boolean, default: true},
  isDeleted: {type: Boolean, default: false},
  refreshToken: {type: String },
  resetToken: {type: String },
    resetTokenExpiry: {type: Date }    
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
