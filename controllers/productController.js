const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler')

 // Create Product
 const createProduct = asyncHandler(async (req, res, next) => {
    try {
        //console.log('Request Body:', req.body);
      const {
        name,
        description,
        category,
        price,
        stock,
        images,
        currency,
        discount,
        warehouse,
      } = req.body;
  
      // Validate required fields
      if (!name || !description || !price || !stock || !currency) {
        res.status(400);
        throw new Error(
          'Missing required fields. Please provide name, description, category, price, stock, and currency.'
        );
      }
  
      // Validate price and stock
      if (price <= 0) {
        res.status(400);
        throw new Error('Price must be greater than zero.');
      }
  
      if (stock < 0) {
        res.status(400);
        throw new Error('Stock cannot be negative.');
      }
  
      // Validate references: check if the category and warehouse exist
      //const categoryExists = await Category.findById(category);
      //if (!categoryExists) {
      //  res.status(404);
      //  throw new Error('Category not found.');
      //}
  
      //const warehouseExists = await Warehouse.findById(warehouse);
      //if (!warehouseExists) {
      //  res.status(404);
      //  throw new Error('Warehouse not found.');
     // }
  
      // Create the product
      const product = new Product({
        name,
        description,
        category,
        price,
        stock,
        images,
        currency,
        discount: discount || 0, // Default discount to 0 if not provided
        warehouse,
      });
  
      // Save the product to the database
      const savedProduct = await product.save();
  
      res.status(201).json({
        success: true,
        product: savedProduct,
      });
    } catch (error) {
      next(error); // Pass the error to the error-handling middleware
    }
  });

// Get All Products
const getAllProducts = asyncHandler(async (req, res, next) => {
    try {
        // Fetch all products and populate the `category` field if it exists
        const products = await Product.find();

        // Respond with a success message and the retrieved products
        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully.',
            count: products.length,
            products,
        });
    } catch (error) {
        // Handle any errors and pass them to the middleware
        next(error);
    }
});

  
  // Get Product by ID
const getProduct = asyncHandler(async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate({
            path: 'category',
            select: 'name description', // Include only relevant fields from the category
        });

        // Check if the product exists
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        // Respond with the product details
        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully.',
            product,
        });
    } catch (error) {
        // Pass any errors to the error-handling middleware
        next(error);
    }
});

// Update Product
const updateProduct = asyncHandler(async (req, res, next) => {
    try {
        // Validate if the product exists
        const product = await Product.findById(req.params.id);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error; // Throw error if product not found
        }

        // Attempt to update the product
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, // Return the updated document
            runValidators: true // Enforce schema validation
        })

        // Respond with the updated product
        res.status(200).json({
            success: true,
            message: 'Product updated successfully.',
            product: updatedProduct,
        });
    } catch (error) {
        // Handle validation errors specifically
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

        // Handle other types of errors (e.g., database errors, general errors)
        if (!error.statusCode) {
            error.statusCode = 500; // Set default status code to 500 if not set
        }

        // Pass the error to the next middleware (error handler)
        next(error);
    }
});


  // Delete Product
  const deleteProduct = asyncHandler(async (req, res, next) => {
    try {
        // Check if the product exists
        const product = await Product.findById(req.params.id);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        // Delete the product
        await Product.findByIdAndDelete(req.params.id);

        // Respond with success message
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully.',
            data: { productId: req.params.id },
        });
    } catch (error) {
        // Handle specific error if product not found
        if (error.statusCode === 404) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        // Handle general errors (database, server, etc.)
        if (!error.statusCode) {
            error.statusCode = 500; // Default to internal server error if not specified
        }

        // Pass the error to the next middleware (error handler)
        next(error);
    }
});


module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,  
};
