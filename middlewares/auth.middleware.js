import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import ApiError from "../utils/api-error.js";
import db from "../config/db.js";
import * as authService from "../modules/auth/auth.service.js";
import { roles } from "../utils/roles.js";
import { StatusCode } from "../utils/status-codes.js";

const protect = asyncHandler(async (req, res, next) => {
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

const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    console.log(req.user[0]);
    if (!roles.includes(req.user[0].role)) {
      return next(
        new ApiError(
          "You are not authorized to access this route!",
          StatusCode.FORBIDDEN,
        ),
      );
    }
    next();
  });

export const allowedToSuper = asyncHandler(async (req, res, next) => {
  if (!req.user.email.endsWith("@hsh.io")) {
    return next(
      new ApiError(
        "You are not authorized to access this route!",
        StatusCode.FORBIDDEN,
      ),
    );
  }
  next();
});

const allowedToUser = (...type) =>
  asyncHandler(async (req, res, next) => {
    if (!type.includes(req.user[0].type)) {
      return next(
        new ApiError(
          "You are not authorized to access this route!",
          StatusCode.FORBIDDEN,
        ),
      );
    }
    next();
  });

export { protect, allowedTo, allowedToUser };
