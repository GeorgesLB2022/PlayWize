const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Missing Token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden - Invalid Token' });
        }

   // if (decoded.exp <= Date.now() / 1000) {
         // Token has expired
     //   return res.status(401).json({ message: 'Token expired' });
   // }

        req.user = decoded;
        next();
    });
};

module.exports = authenticateToken;