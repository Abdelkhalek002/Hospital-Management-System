import { validationResult } from "express-validator";
import { StatusCode } from "../utils/status-codes.js";

//@desc finds the validation errors in this request and wraps them into handy functions
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCode.BAD_REQUEST).json({
      status: "fail",
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
};

export default handleValidationErrors;
