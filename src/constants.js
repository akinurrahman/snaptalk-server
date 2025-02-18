export const DB_NAME = "snaptalk";
export const PORT = 8000;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
};

// tiems in seconds
export const ACCESS_TOKEN_EXPIRES_IN = 1000 * 60 * 15; // 15 minutes
export const REFRESH_TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 24 * 15; // 15 days


//error codes 
export const ERROR_CODES ={
  INTERNAL_SERVER_ERROR: "ERR_INTERNAL_SERVER",
  UNAUTHORIZED: "ERR_UNAUTHORIZED",
  FORBIDDEN: "ERR_FORBIDDEN",
  NOT_FOUND: "ERR_NOT_FOUND",
  BAD_REQUEST: "ERR_BAD_REQUEST",
  VALIDATION_ERROR: "ERR_VALIDATION",
  DUPLICATE_ENTRY: "ERR_DUPLICATE_ENTRY",
  INVALID_CREDENTIALS: "ERR_INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "ERR_TOKEN_EXPIRED",
  INVALID_TOKEN: "ERR_INVALID_TOKEN"

}