import {
  cookieOptions,
  ERROR_CODES,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../constants.js";
import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "All fields are required", ERROR_CODES.BAD_REQUEST);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists", ERROR_CODES.BAD_REQUEST);
  }

  const user = await User.create({
    email,
    password,
  });

  const profile = await Profile.create({
    user: user._id,
    fullName,
  });

  user.profile = profile._id;

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save();

  const userResponse = {
    _id: user._id,
    email: user.email,
    fullName: profile.fullName,
  };

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_EXPIRES_IN,
    })
    .json(
      new ApiResponse(
        201,
        {
          accessToken,
          user: userResponse,
        },
        "User registered successfully"
      )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required", ERROR_CODES.BAD_REQUEST);
  }

  const user = await User.findOne({ email }).populate(
    "profile",
    "fullName profilePicture"
  );

  if (!user) {
    throw new ApiError(
      400,
      "Invalid email or password",
      ERROR_CODES.BAD_REQUEST
    );
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(
      400,
      "Invalid email or password",
      ERROR_CODES.BAD_REQUEST
    );
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save();

  const userResponse = {
    _id: user._id,
    email: user.email,
    fullName: user.profile.fullName,
    profilePicture: user.profile.profilePicture,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_EXPIRES_IN,
    })
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          user: userResponse,
        },
        "User logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user?._id, { refreshToken: undefined });

  res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken = req.cookies.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized", ERROR_CODES.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findOne({ refreshToken: incommingRefreshToken });

    if (!user) {
      throw new ApiError(401, "Unauthorized", ERROR_CODES.UNAUTHORIZED);
    }

    if (decoded._id !== user._id.toString()) {
      throw new ApiError(401, "Token mismatch or expired", ERROR_CODES.UNAUTHORIZED);
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;

    await user.save();

    res
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_EXPIRES_IN,
      })
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.clearCookie("refreshToken", cookieOptions);
      throw new ApiError(
        401,
        "Session expired, please login again",
        ERROR_CODES.SESSION_EXPIRED
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error(`Invalid token attempt: ${req.ip}`);
      throw new ApiError(401, "Invalid token", ERROR_CODES.INVALID_TOKEN);
    }
    throw error;
  }
});
