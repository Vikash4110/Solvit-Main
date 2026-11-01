import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin-model.js';

export const verifyJWTAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : authHeader?.trim();
    const token = bearerToken || req.cookies?.adminAccessToken || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized request - No token provided',
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decodedToken.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Admin access required',
      });
    }

    const admin = await Admin.findById(decodedToken._id).select('-password').lean();

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token - Admin not found',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive',
      });
    }

    if (decodedToken.tokenVersion && decodedToken.tokenVersion !== admin.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session revoked. Please login again.',
      });
    }

    req.verifiedAdminId = admin;
    req.user = admin;
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Access token expired'
        : error.message || 'Invalid access token';

    return res.status(401).json({
      success: false,
      message,
    });
  }
};
