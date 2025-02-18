import { cookieOptions, ERROR_CODES, REFRESH_TOKEN_EXPIRES_IN } from "../constants.js";
import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

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
