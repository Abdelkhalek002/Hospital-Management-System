import asyncHandler from "express-async-handler";
import ApiError from "../utils/api-error.js";
import * as authService from "../modules/auth/auth.service.js";
import { roles } from "../utils/roles.js";
import { rolePermissions } from "../utils/permissions.js";
import { StatusCode } from "../utils/status-codes.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
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

  const user = await authService.protect(token);

  if (user.status === "inactive" || user.is_active === false) {
    return next(
      new ApiError(
        "Your account is inactive or suspended. Please contact support.",
        StatusCode.FORBIDDEN,
      ),
    );
  }

  req.user = user;
  next();
});

export const allowedTo = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    const isSuperAdmin = req.user?.role === roles.SUPER_ADMIN;
    const isAllowedRole = allowedRoles.includes(req.user?.role);
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

export const hasPermission = (...requiredPermissions) =>
  asyncHandler(async (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return next(
        new ApiError(
          "Access denied. Admin account required.",
          StatusCode.FORBIDDEN,
        ),
      );
    }

    if (userRole === roles.SUPER_ADMIN) {
      return next();
    }

    const userPerms = rolePermissions[userRole] || [];
    const hasAccess = requiredPermissions.every(
      (perm) => userPerms.includes(perm) || userPerms.includes("*"),
    );

    if (!hasAccess) {
      return next(
        new ApiError(
          "You do not have permission to perform this action!",
          StatusCode.FORBIDDEN,
        ),
      );
    }
    next();
  });

export const anyAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user?.role) {
    return next(
      new ApiError(
        "Access denied. Admin account required.",
        StatusCode.FORBIDDEN,
      ),
    );
  }
  next();
});

export const isOwnerOrAdmin = (paramKey = "id") =>
  asyncHandler(async (req, res, next) => {
    const targetId = Number(req.params[paramKey]);
    const currentUserId = req.user?.id;
    const isSuperAdmin = req.user?.role === roles.SUPER_ADMIN;

    if (currentUserId === targetId || isSuperAdmin) {
      return next();
    }

    return next(
      new ApiError(
        "You are only allowed to manage your own data!",
        StatusCode.FORBIDDEN,
      ),
    );
  });

export const restrictToUser = asyncHandler(async (req, res, next) => {
  // Regular users have no 'role' attribute; only admin accounts have 'role'
  if (req.user?.role) {
    return next(
      new ApiError(
        "This route is only accessible to regular users!",
        StatusCode.FORBIDDEN,
      ),
    );
  }
  next();
});