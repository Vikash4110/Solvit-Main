import jwt from 'jsonwebtoken';
import { Client } from '../models/client-model.js';
import { Counselor } from '../models/counselor-model.js';
import { ApiError } from '../utils/ApiError.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : authHeader?.trim();
    const token =
      bearerToken ||
      req.cookies?.accessToken ||
      req.cookies?.clientAccessToken ||
      req.cookies?.counselorAccessToken;

    if (!token) {
      return next(new ApiError(401, 'Unauthorized access - No token provided'));
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Token expired'));
      }
      return next(new ApiError(401, 'Invalid token'));
    }

    if (!decodedToken?._id) {
      return next(new ApiError(401, 'Invalid token structure'));
    }

    const { _id, role } = decodedToken;
    let user = null;
    let userType = role || 'client';

    if (role === 'counselor') {
      user = await Counselor.findById(_id).select('-password').lean();
    } else if (role === 'client') {
      user = await Client.findById(_id).select('-password').lean();
    } else {
      user = await Client.findById(_id).select('-password').lean();
      if (!user) {
        user = await Counselor.findById(_id).select('-password').lean();
        userType = 'counselor';
      }
    }

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    if (user.isBlocked) {
      return next(new ApiError(403, 'Account is blocked'));
    }

    if (decodedToken.tokenVersion && decodedToken.tokenVersion !== user.tokenVersion) {
      return next(new ApiError(401, 'Session revoked. Please login again.'));
    }

    req.user = user;
    req.userType = userType;
    req.verifiedUser = user;
    next();
  } catch (error) {
    return next(new ApiError(401, error?.message || 'Authentication failed'));
  }
};
