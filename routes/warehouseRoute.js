const express = require('express');
const router = express.Router();
const {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  getActiveWarehouses,
  getWarehousesByInventoryCount
} = require('../controllers/warehouseController');

// Create a warehouse
router.post('/', createWarehouse);

// Get all warehouses
router.get('/', getAllWarehouses);

// Get a warehouse by ID
router.get('/:id', getWarehouseById);

// Update a warehouse
router.put('/:id', updateWarehouse);

// Delete a warehouse
router.delete('/:id', deleteWarehouse);

// Get all active warehouses
router.get('/active', getActiveWarehouses);

// Get warehouses by inventory count
router.get('/inventory', getWarehousesByInventoryCount);

module.exports = router;
