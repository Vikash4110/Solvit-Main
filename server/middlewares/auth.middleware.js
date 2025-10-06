import jwt from 'jsonwebtoken';
import { Client } from '../models/client-model.js';
import { Counselor } from '../models/counselor-model.js';
import { ApiError } from '../utils/ApiError.js';

export const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.cookies?.clientAccessToken ||
      req.cookies?.counselorAccessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new ApiError(401, 'Unauthorized access - No token provided'));
    }

    // Verify token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return next(new ApiError(401, 'Invalid token'));
      } else if (jwtError.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Token expired'));
      } else {
        return next(new ApiError(401, 'Token verification failed'));
      }
    }

    if (!decodedToken?._id) {
      return next(new ApiError(401, 'Invalid token structure'));
    }

    // Check if user is client or counselor
    let user = await Client.findById(decodedToken._id).select('-password');
    let userType = 'client';

    if (!user) {
      user = await Counselor.findById(decodedToken._id).select('-password');
      userType = 'counselor';
    }

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    // Add user and userType to request
    req.user = user;
    req.userType = userType;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return next(new ApiError(401, 'Authentication failed'));
  }
};
