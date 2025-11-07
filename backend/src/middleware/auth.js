const jwt = require('jsonwebtoken');

/**
 * Authentication middleware - Verify JWT token
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided. Please login first.'
        }
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user info to request object
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token. Please login again.'
        }
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication error'
      }
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {array} allowedRoles - Array of allowed roles (e.g., ['admin', 'staff'])
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        }
      });
    }

    next();
  };
};

// Alias exports for consistency
const authenticateToken = auth;
const requireRole = authorize;

module.exports = { auth, authorize, authenticateToken, requireRole };
