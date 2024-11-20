const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

// Create User (Sign Up)
  const addUser = asyncHandler(async (req, res, next) => {
    try {
      const { firstName, lastName, email, password, address, phone } = req.body;
  
      if (!firstName || !lastName || !email || !password || !phone || !address) {
        res.status(400); // Bad Request
        throw new Error('All required fields must be provided');
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        address, // Expects address as an array of objects
        password: hashedPassword,
      });
  
      await newUser.save();
  
      res.status(201).json({
        isSuccess: true,
        message: 'User created successfully',
        userId: newUser._id,
      });
    } catch (error) {
      if (error.code === 11000 && error.keyValue) {
        res.status(400); // Bad Request
        next(new Error(`Duplicate value for field: ${Object.keys(error.keyValue).join(', ')}`));
      } else if (error.name === 'ValidationError') {
        res.status(400); // Bad Request
        next(new Error(`Validation Error: ${error.message}`));
      } else {
        next(error); // Pass other errors to middleware
      }
    }
  })

  const getUsers = asyncHandler(async (req, res, next) => {
    try {
      // Optionally, you could add pagination here
      const { page = 1, limit = 10 } = req.query; // Default page 1, limit 10
      const skip = (page - 1) * limit;
  
      // Fetch users with pagination
      const users = await User.find().skip(skip).limit(Number(limit));
  
      // Optional: Total count for pagination
      const totalUsers = await User.countDocuments();
  
      res.status(200).json({
        isSuccess: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          totalUsers,
          currentPage: Number(page),
          totalPages: Math.ceil(totalUsers / limit),
        },
      });
    } catch (error) {
      // Handling any error and passing it to the error middleware
      next(error);
    }
  })

// Get User by ID
const getUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
  
    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400); // Bad Request
      throw new Error('Invalid user ID format');
    }
  
    try {
      // Find user by ID
      const user = await User.findById(id);
  
      // If user not found, throw error
      if (!user) {
        res.status(404); // Not Found
        throw new Error(`User with ID ${id} not found`);
      }
  
      // Respond with the found user
      res.status(200).json({
        isSuccess: true,
        data: user,
      });
    } catch (error) {
      // Pass error to the global error handler
      next(error);
    }
  })
// Update User
const updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Check if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400); // Bad Request
    throw new Error('Invalid ID format');
  }
  
    // Validate user input (e.g., ensure required fields are provided if updating certain values)
    if (!id) {
      res.status(400); // Bad Request
      throw new Error('User ID is required');
    }
  
    const updatedData = req.body;
  
    try {
      const user = await User.findByIdAndUpdate(id, updatedData, { 
        new: true, // Return the updated document
        runValidators: true // Ensure the data being updated adheres to the schema's rules
      });
  
      if (!user) {
        res.status(404); // Not Found
        throw new Error(`User with ID ${id} not found`);
      }
  
      res.status(200).json(user);
    } catch (error) {
        if (error.code === 11000 && error.keyValue) {
            // Handle duplicate key error (E11000)
            res.status(400); // Bad Request
            next(new Error(`Duplicate value for field: ${Object.keys(error.keyValue).join(', ')}`));
          } else if (error.name === 'ValidationError') {
            // Handle validation errors
            res.status(400);
            next(new Error(`Validation Error: ${error.message}`));
          } else {
            // Other errors
            next(error);
          } // Passes error to errorMiddleware
    }
  });
  

// Delete User
const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
  
    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400); // Bad Request
      throw new Error('Invalid user ID format');
    }
  
    try {
      // Find the user by ID and delete
      const user = await User.findByIdAndDelete(id);
  
      // If user is not found, throw an error
      if (!user) {
        res.status(404); // Not Found
        throw new Error(`User with ID ${id} not found`);
      }
  
      // Log the successful deletion (optional)
      console.log(`User with ID ${id} deleted successfully`);
  
      // Respond with a success message
      res.status(200).json({
        isSuccess: true,
        message: 'User deleted successfully',
        data: { id },
      });
    } catch (error) {
      // Pass error to the global error handler
      next(error);
    }
  })

// Utility to generate JWT tokens with the same secret for both access and refresh tokens
const generateTokens = (userId) => {
    // JWT payload - Now only containing the user ID
    const payload = { userId };
  
    // Access Token (expires in 1 hour)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    // Refresh Token (expires in 7 days)
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  
    return { accessToken, refreshToken };
  }

// Login user - Controller
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
  
    try {
      // Step 1: Check if email exists
      const user = await User.findOne({ email });
  
      if (!user) {
        res.status(404); // Not Found
        throw new Error('User not found. Please check your email or sign up.');
      }
  
      // Step 2: Compare the entered password with the hashed password in the DB
      const isPasswordMatch = await bcrypt.compare(password, user.password);
  
      if (!isPasswordMatch) {
        res.status(401); // Unauthorized
        throw new Error('Invalid password. Please try again.');
      }
  
      // Step 3: Generate JWT tokens (access and refresh)
      const { accessToken, refreshToken } = generateTokens(user._id);
  
      // Step 4: Store only the refresh token in the database
      user.refreshToken = refreshToken;
  
      // Save the user with the updated refresh token
      await user.save();
  
      // Step 5: Send the response with the necessary data (access token, refresh token)
      res.status(200).json({
        isSuccess: true,
        message: 'Login successful',
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          tokens: {
            accessToken, // Access token sent to the client
            refreshToken, // Refresh token sent to the client (this will be used to get a new access token when it expires)
          },
        },
      });
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  })

const checkUserActiveStatus = asyncHandler(async (req, res, next) => {
    const { email } = req.body;  // Assumes email is passed in the request body
    
    try {
      // Find user by email
      const user = await User.findOne({ email });
  
      // If user doesn't exist
      if (!user) {
        const error = new Error('User not found');
        res.status(404);  // Send 404 status before throwing the error
        throw error;
      }
  
      // Check if the user is active
      if (!user.isActive) {
        const error = new Error('User is not active');
        res.status(400);  // Send 400 status before throwing the error
        throw error;
      }
  
      // If email exists and is active
      res.status(200).json({ isValid: true });
    } catch (error) {
      next(error);  // Pass the error to error-handling middleware
    }
  })
 

// Controller to reset password using email and token
const resetPassword = asyncHandler(async (req, res) => {
    const { email, token, newPassword } = req.body; // Capture email, token, and new password from the request body
  
    // Validate inputs
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
  
    // Check if the token matches and is not expired
    if (user.resetToken !== token || Date.now() > user.resetTokenExpiry) {
      throw new Error('Invalid or expired reset token');
    }
  
    // Hash the new password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
  
    try {
      // Update user's password in the database
      user.password = hashedPassword;
      user.resetToken = undefined; // Clear the reset token after successful password reset
      user.resetTokenExpiry = undefined; // Clear the expiration time
      await user.save(); // Save updated user data
  
      // Respond with success message
      return res.status(200).json({
        success: true,
        message: 'Password reset successful.',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Error resetting password');
    }
  })

// utils/generateRandomToken.js
function generateRandomToken() {
    return Math.floor(10000000 + Math.random() * 90000000).toString(); // 8-digit random number
  }

// Controller to send token for password reset
const sendResetToken = asyncHandler(async (req, res) => {
    const { email } = req.body; // Capture email from request body
  
    // Check if the user exists and is active
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
  
    // Generate a random 8-digit token
    const token = generateRandomToken();
  
    // Set token in user object (could store it temporarily or in the database)
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
    await user.save(); // Save the token to the database
  
    // Set up email transporter using environment variables for security
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Use Gmail account from environment variables
        pass: process.env.GMAIL_APP_PASSWORD, // Use app password stored in environment variables
      },
    });
  
    // Email options to send token to user
    const mailOptions = {
      from: `"PlayWize" <${process.env.GMAIL_USER}>`, // Sender email
      to: email, // Recipient email
      subject: 'Password Reset Token',
      text: `Your password reset token is: ${token}`, // Plain text body
      html: `<p>Your password reset token is: <strong>${token}</strong></p>`, // HTML body
    };
  
    try {
      // Send the email with the token
      const info = await transporter.sendMail(mailOptions);
      console.log('Token sent: %s', info.messageId);
  
      // Respond to client with success message
      return res.status(200).json({
        success: true,
        message: 'Password reset token sent successfully.',
        messageId: info.messageId,
      });
    } catch (error) {
      console.error('Error sending token email:', error);
      throw new Error('Error sending reset token email');
    }
  })




module.exports = {

  getUser,  
  updateUser,  
  deleteUser,
  getUsers,
  addUser,
  loginUser,
  checkUserActiveStatus,
  resetPassword,
  sendResetToken,

  }

