import jwt from "jsonwebtoken";
import { promisify } from "util";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";

export const signToken = (user, expiresIn = process.env.JWT_EXPIRE_TIME || "90d") => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError("JWT_SECRET is not configured in environment variables", StatusCode.INTERNAL_SERVER_ERROR);
  }

  const { id, email, role } = user;
  const type = user.userType || (role ? "admins" : "users");
  if (type === "super_admins" || type === "admins" || role) {
    const token = jwt.sign({ id, email, type: "admins", role }, process.env.JWT_SECRET, {
      expiresIn,
    });
    return token;
  }
  const token = jwt.sign({ id, email, type: "users" }, process.env.JWT_SECRET, {
    expiresIn,
  });
  return token;
};

export const verifyToken = async (token, secret) => {
  const decoded = await promisify(jwt.verify)(token, secret);
  if (!decoded)
    throw new ApiError("Invalid JWT token", StatusCode.UNAUTHORIZED);
  return decoded;
};
