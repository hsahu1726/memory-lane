// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // 1. Check for token in the Authorization header
    const authHeader = req.header('Authorization');
    
    // Authorization header format is typically "Bearer TOKEN"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Extract the token part
    const token = authHeader.replace('Bearer ', '');
    
    try {
        // 2. Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the userId to the request object for use in routes
        req.userId = decoded.id; 
        
        // 4. Continue to the next middleware or the route handler
        next();
    } catch (err) {
        // If verification fails (e.g., token expired, wrong signature)
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = auth;