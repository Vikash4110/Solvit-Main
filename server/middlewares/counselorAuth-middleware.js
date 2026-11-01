import jwt from 'jsonwebtoken';
import { Counselor } from '../models/counselor-model.js';
import { wrapper } from '../utils/wrapper.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const verifyJWTCounselor = wrapper(async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : authHeader?.trim();
    const token = bearerToken || req.cookies?.accessToken;

    if (!token) {
      return next(new ApiError(401, 'Unauthorized access: No token provided'));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decodedToken.role && decodedToken.role !== 'counselor') {
      return next(new ApiError(403, 'Access forbidden: Counselor authorization required'));
    }

    const verifiedCounselor = await Counselor.findById(decodedToken?._id)
      .select('_id isBlocked tokenVersion')
      .lean();

    if (!verifiedCounselor) {
      return next(new ApiError(401, 'Invalid access token: Counselor not found'));
    }

    if (verifiedCounselor.isBlocked) {
      return next(new ApiError(403, 'Account is blocked. Please contact support.'));
    }

    if (decodedToken.tokenVersion && decodedToken.tokenVersion !== verifiedCounselor.tokenVersion) {
      return next(new ApiError(401, 'Session revoked. Please login again.'));
    }

    req.verifiedCounselorId = verifiedCounselor;
    req.user = verifiedCounselor;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    }

    const message =
      error.name === 'TokenExpiredError'
        ? 'Access token expired'
        : error?.message || 'Invalid access token';

    return res.status(401).json(new ApiResponse(401, null, message));
  }
});
