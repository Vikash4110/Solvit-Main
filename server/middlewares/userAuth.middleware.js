import { wrapper } from '../utils/wrapper.js';
import { Client } from '../models/client-model.js';
import { Counselor } from '../models/counselor-model.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const verifyJWTUser = wrapper(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.cookies?.clientAccessToken ||
      req.cookies?.counselorAccessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new ApiError(401, 'Unauthorized access'));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken?._id) {
      return next(new ApiError(401, 'Invalid token structure'));
    }

    const { _id, role } = decodedToken;
    let user = null;
    let userType = role || 'client';

    // Direct single-query lookup based on embedded JWT role
    if (role === 'counselor') {
      user = await Counselor.findById(_id).select('-password');
    } else if (role === 'client') {
      user = await Client.findById(_id).select('-password');
    } else {
      // Backward compatibility fallback for legacy tokens without role claim
      user = await Client.findById(_id).select('-password');
      if (!user) {
        user = await Counselor.findById(_id).select('-password');
        userType = 'counselor';
      }
    }

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    req.user = user;
    req.userType = userType;
    req.verifiedUser = user;

    next();
  } catch (error) {
    // If it's already an ApiError, just send it; otherwise wrap it
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    }

    return res
      .status(401)
      .json(new ApiResponse(401, null, error?.message || 'Invalid access token'));
  }
});
