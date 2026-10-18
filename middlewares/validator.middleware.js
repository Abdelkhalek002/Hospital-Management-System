import { validationResult } from "express-validator";
import { StatusCode } from "../utils/status-codes.js";
import ApiError from "../utils/api-error.js";

//@desc finds the validation errors in this request and wraps them into handy functions
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((e) => (typeof e.msg === "object" && e.msg?.message ? e.msg.message : e.msg))
      .join(", ");

    return next(new ApiError(errorMessages, StatusCode.BAD_REQUEST));
  }
  next();
};

export default handleValidationErrors;
