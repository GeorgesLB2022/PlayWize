const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the warehouse
  location: {
    address: { type: String, required: true }, // Address of the warehouse
    city: { type: String, required: true },
    state: { type: String, required: false },
    country: { type: String, required: true },
    postalCode: { type: String, required: false }
  },
  capacity: { type: Number, required: true }, // Total storage capacity in units
  manager: {
    name: { type: String, required: true }, // Name of the manager
    contact: { type: String, required: true } // Contact details (phone/email)
  },
  inventoryCount: { type: Number, default: 0 }, // Current number of items stored
  isActive: { type: Boolean, default: true } // Indicates if the warehouse is operational
}, 
{ timestamps: true });

module.exports = mongoose.model('Warehouse', WarehouseSchema);
