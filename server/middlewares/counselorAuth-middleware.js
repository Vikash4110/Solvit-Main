import jwt from 'jsonwebtoken';
import { Counselor } from '../models/counselor-model.js';
import { wrapper } from '../utils/wrapper.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const verifyJWTCounselor = wrapper(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new ApiError(401, 'Unauthorized access'));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const verifiedCounselor = await Counselor.findById(decodedToken?._id).select('_id');

    if (!verifiedCounselor) {
      return next(new ApiError(401, 'Invalid access token'));
    }

    req.verifiedCounselorId = verifiedCounselor;

    next();
  } catch (error) {
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
