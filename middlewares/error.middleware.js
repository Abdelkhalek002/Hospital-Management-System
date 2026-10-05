import ApiError from "../utils/api-error.js";
import { StatusCode } from "../utils/status-codes.js";

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    // - Operational, Trusted Error: Send Message To The Client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // - Programming Or Other Unknown Error
    //1) log the error
    console.error("ERROR ⚠️:", err);
    //2) send generic message
    return res.status(500).json({
      status: "Error",
      message: "Something Went Wrong!",
    });
  }
};

const handleJWTError = () =>
  new ApiError("Invalid token, Please log in again.", StatusCode.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new ApiError(
    "Your token has expired, Please log in again.",
    StatusCode.UNAUTHORIZED,
  );

const handleMulterError = (error) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return new ApiError(
      "حجم الملف كبير جداً، الحد الأقصى المسموح به هو 10 ميجابايت",
      StatusCode.BAD_REQUEST,
    );
  }
  return new ApiError(
    `خطأ في رفع الملف: ${error.message}`,
    StatusCode.BAD_REQUEST,
  );
};

const globalError = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "Error";

  if (error.name === "MulterError") {
    error = handleMulterError(error);
  }

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(error, req, res);
  }
};

export default globalError;
