const Category = require('../models/categoryModel'); // Import Category model
const asyncHandler = require('express-async-handler'); // For handling async errors
//const { validationResult } = require('express-validator'); // For handling validation

// 1. Add a New Category (Create)
const addCategory = asyncHandler(async (req, res, next) => {
    try {
        const { name, description, parentCategory } = req.body;

        // Create and save new category
        const category = new Category({
            name,
            description,
            parentCategory
        });

        await category.save();
        
        // Success response
        res.status(201).json({
            success: true,
            message: 'Category created successfully.',
            category,
        });
    } catch (error) {
        // Handle validation errors
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

        // Handle duplicate key error (category name already exists)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists.',
            });
        }

        // Forward other errors to the global error handler
        next(error);
    }
});

// 2. Get All Categories
const getAllCategories = asyncHandler(async (req, res, next) => {
    try {
        const categories = await Category.find().populate('parentCategory', 'name');

        // Success response
        res.status(200).json({
            success: true,
            categories,
        });
    } catch (error) {
        next(error);
    }
});

// 3. Get a Single Category by ID
const getCategory = asyncHandler(async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id).populate('parentCategory', 'name');

        if (!category) {
            const error = new Error('Category not found.');
            error.statusCode = 404;
            throw error;
        }

        // Success response
        res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        next(error);
    }
});

// 4. Update Category
const updateCategory = asyncHandler(async (req, res, next) => {
    try {
        const { name, description, parentCategory } = req.body;

        // Find the category by ID
        const category = await Category.findById(req.params.id);

        if (!category) {
            const error = new Error('Category not found.');
            error.statusCode = 404;
            throw error;
        }

        // Update the category with new data
        category.name = name || category.name;
        category.description = description || category.description;
        category.parentCategory = parentCategory || category.parentCategory;

        // Save the updated category
        await category.save();

        // Success response
        res.status(200).json({
            success: true,
            message: 'Category updated successfully.',
            category,
        });
    } catch (error) {
       // Handle validation errors
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

    // Handle duplicate key error (category name already exists)
    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Category with this name already exists.',
        });
    }

    // Forward other errors to the global error handler
    next(error);
    }
});

// 5. Delete Category
const deleteCategory = asyncHandler(async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            const error = new Error('Category not found.');
            error.statusCode = 404;
            throw error;
        }

        // Success response
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
});

// Export controllers
module.exports = {
    addCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,
};
