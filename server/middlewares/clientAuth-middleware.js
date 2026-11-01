import { wrapper } from '../utils/wrapper.js';
import { Client } from '../models/client-model.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const verifyJWTClient = wrapper(async (req, res, next) => {
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

    if (decodedToken.role && decodedToken.role !== 'client') {
      return next(new ApiError(403, 'Access forbidden: Client authorization required'));
    }

    const verifiedClient = await Client.findById(decodedToken?._id)
      .select('_id isBlocked tokenVersion')
      .lean();

    if (!verifiedClient) {
      return next(new ApiError(401, 'Invalid access token: Client not found'));
    }

    if (verifiedClient.isBlocked) {
      return next(new ApiError(403, 'Account is blocked. Please contact support.'));
    }

    if (decodedToken.tokenVersion && decodedToken.tokenVersion !== verifiedClient.tokenVersion) {
      return next(new ApiError(401, 'Session revoked. Please login again.'));
    }

    req.verifiedClientId = verifiedClient;
    req.user = verifiedClient;

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
