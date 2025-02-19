import { ApiError, asyncHandler } from "../utils/index.js";
import jwt from "jsonwebtoken";
import { ERROR_CODES } from "../constants.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError(
        401,
        "Please login to access this resource",
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded?.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(
        401,
        "Please login to access this resource",
        ERROR_CODES.UNAUTHORIZED
      );
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Internal server error",
      ERROR_CODES.INTERNAL_SERVER_ERROR
    );
  }
});
