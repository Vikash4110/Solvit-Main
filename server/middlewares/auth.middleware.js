import { wrapper } from '../utils/wrapper.js';
import { Client } from '../models/client-model.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const verifyJWTClient = wrapper(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new ApiError(401, "Unauthorized access"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const verifiedClient = await Client.findById(decodedToken?._id).select("_id");
    

    if (!verifiedClient) {
      return next(new ApiError(401, "Invalid access token"));
    }
    console.log("yoyoy")

    req.verifiedClientId = verifiedClient;

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
      .json(new ApiResponse(401, null, error?.message || "Invalid access token"));
  }
});
