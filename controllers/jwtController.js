
const Kids = require('../models/kidModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require("bcrypt")
const authenticateToken = require('../middleware/jwtMiddleware')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

//create JWT secret Key

const setcredential = asyncHandler(async(req,res)=>{
    try {
        const JWT_SECRET = crypto.randomBytes(32).toString('hex');
    res.send({JWT_SECRET});
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
    
})

//create JWT Tokens

const generateToken = (Id) => {
    return jwt.sign({ Id }, process.env.JWT_SECRET, { expiresIn: '1m' });
};

const createToken = asyncHandler(async(req,res)=>{
    try {
        const {Id} = req.body.Id             
        const token = generateToken(Id);
        res.json({ token });
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

//create JWT Refresh Tokens

const generateRefreshToken = (Id) => {
    return jwt.sign({ Id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};
const createRefreshToken = asyncHandler(async(req,res)=>{
    try {
        const {Id} = req.body.Id             
        const token = generateRefreshToken(Id);
        res.json({ token });
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

//refresh active token
const RefreshActiveToken = asyncHandler(async(req,res)=>{
    try {
        const refreshtoken = req.header('Authorization');
        jwt.verify(refreshtoken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden - Invalid Refresh Token' });
            }          
            req.user = decoded;
            //here we need to check user validity
            const {Id} = req.body.Id             
            const token = generateToken(Id);
            res.json({ token });
            //next();
        });
       
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})


module.exports = {
   
    setcredential,
    createToken,
    createRefreshToken,
    RefreshActiveToken

}