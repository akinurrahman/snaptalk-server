import { ERROR_CODES } from "../constants.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict", // Prevent CSRF attacks by restricting cookie transmission
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
};

export const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(
      400,
      "Please provide all the required fields",
      ERROR_CODES.MISSING_FIELDS
    );
  }

  const isUserExists = await User.findOne({ email });

  if (isUserExists) {
    throw new ApiError(
      400,
      "User already exists",
      ERROR_CODES.DUPLICATE_RESOURCE
    );
  }

  const user = new User({ fullName, email, password });
  await user.save();

  res.status(201).json(new ApiResponse(201, {}, "User created successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      400,
      "Please provide all the required fields",
      ERROR_CODES.MISSING_FIELDS
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found", ERROR_CODES.RESOURCE_NOT_FOUND);
  }

  const isPasswordMatch = await user.isPasswordMatched(password);

  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid credentials", ERROR_CODES.INVALID_INPUT);
  }

  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  res.cookie("refreshToken", refreshToken, options);

  res
    .status(200)
    .json(new ApiResponse(200, { accessToken }, "Login successful"));
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized", ERROR_CODES.UNAUTHORIZED);
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  if (!decoded) {
    throw new ApiError(401, "Unauthorized", ERROR_CODES.UNAUTHORIZED);
  }

  const user = await User.findById(decoded._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized", ERROR_CODES.UNAUTHORIZED);
  }

  const accessToken = await user.generateAccessToken();

  res
    .status(200)
    .json(
      new ApiResponse(200, { accessToken }, "Token refreshed successfully")
    );
});
