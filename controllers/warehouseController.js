const Warehouse = require('../models/warehouseModel'); // Assuming Warehouse model is in the 'models' directory
const asyncHandler = require('express-async-handler'); // To handle asynchronous requests cleanly

// Create a new warehouse
const createWarehouse = asyncHandler(async (req, res, next) => {
  try {
    const { name, location, capacity, manager, inventoryCount, isActive } = req.body;

    // Validate required fields
    if (!name || !location || !location.city || !location.country) {
      return res.status(400).json({
        success: false,
        message: 'Name, city, and country are required fields.'
      });
    }

    // Create the warehouse
    const newWarehouse = await Warehouse.create({
      name,
      location,
      capacity: capacity || 0,
      manager: manager || {},
      inventoryCount: inventoryCount || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully.',
      warehouse: newWarehouse
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
});

// Get all warehouses
const getAllWarehouses = asyncHandler(async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find();
    res.status(200).json({
      success: true,
      warehouses
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
});

// Get a warehouse by ID
const getWarehouseById = asyncHandler(async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found.'
      });
    }

    res.status(200).json({
      success: true,
      warehouse
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
});

// Update warehouse details
const updateWarehouse = asyncHandler(async (req, res, next) => {
  try {
    const { name, location, capacity, manager, inventoryCount, isActive } = req.body;
    
    // Find the warehouse by ID
    let warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found.'
      });
    }

    // Update the fields
    warehouse.name = name || warehouse.name;
    warehouse.location = location || warehouse.location;
    warehouse.capacity = capacity || warehouse.capacity;
    warehouse.manager = manager || warehouse.manager;
    warehouse.inventoryCount = inventoryCount || warehouse.inventoryCount;
    warehouse.isActive = isActive !== undefined ? isActive : warehouse.isActive;

    // Save the updated warehouse
    await warehouse.save();

    res.status(200).json({
      success: true,
      message: 'Warehouse updated successfully.',
      warehouse
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
});

// Delete a warehouse by ID
const deleteWarehouse = asyncHandler(async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Warehouse deleted successfully.'
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
});

// Get active warehouses (those that are operational)
const getActiveWarehouses = asyncHandler(async (req, res, next) => {
  try {
    const activeWarehouses = await Warehouse.find({ isActive: true });
    res.status(200).json({
      success: true,
      activeWarehouses
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
});

// Get warehouses with inventory count greater than a specified value
const getWarehousesByInventoryCount = asyncHandler(async (req, res, next) => {
  try {
    const { minInventory } = req.query;

    if (!minInventory) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a minimum inventory count.'
      });
    }

    const warehouses = await Warehouse.find({ inventoryCount: { $gte: minInventory } });

    if (warehouses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No warehouses found with the specified inventory count.'
      });
    }

    res.status(200).json({
      success: true,
      warehouses
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
});

module.exports = {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  getActiveWarehouses,
  getWarehousesByInventoryCount
};
