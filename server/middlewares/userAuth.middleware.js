import { wrapper } from '../utils/wrapper.js';
import { Client } from '../models/client-model.js';
import { Counselor } from '../models/counselor-model.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const verifyJWTUser = wrapper(async (req, res, next) => {
  try {
    console.log(req.cookies?.accessToken);
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new ApiError(401, 'Unauthorized access'));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

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
