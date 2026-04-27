import asyncHandler from "express-async-handler";
import ApiError from "../utils/api-error.js";
import * as authService from "../modules/auth/auth.service.js";
import { roles } from "../utils/roles.js";
import { StatusCode } from "../utils/status-codes.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in. Please login to access this route !",
        StatusCode.UNAUTHORIZED,
      ),
    );
  }
  req.user = await authService.protect(token);
  next();
});

export const allowedTo = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    const isSuperAdmin = req.user.email.endsWith(
      process.env.SUPER_ADMIN_EMAIL_DOMAIN,
    );
    const isAllowedRole = allowedRoles.includes(req.user.role);
    if (!isSuperAdmin && !isAllowedRole) {
      return next(
        new ApiError(
          "You are not authorized to access this route!",
          StatusCode.FORBIDDEN,
        ),
      );
    }
    next();
  });

export const restrictToUser = asyncHandler(async (req, res, next) => {
  if (!req.user.email.endsWith(process.env.USER_EMAIL_DOMAIN)) {
    return next(
      new ApiError(
        "You are not authorized to access this route!",
        StatusCode.FORBIDDEN,
      ),
    );
  }
  next();
});
