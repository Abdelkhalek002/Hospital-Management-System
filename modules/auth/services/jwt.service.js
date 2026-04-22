import jwt from "jsonwebtoken";
import { promisify } from "util";
import ApiError from "../../../utils/api-error.js";
import { StatusCode } from "../../../utils/status-codes.js";

export const signToken = (user, expiresIn) => {
  const { id, email } = user;
  const userType = user.userType;
  const token = jwt.sign({ id, email, userType }, process.env.JWT_SECRET, {
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
