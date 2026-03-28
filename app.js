import path from "path";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
//import redis from "redis";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./utils/api-error.js";
import globalError from "./middlewares/error.middleware.js";

// ROUTES
import userReservationRoute from "./modules/reservations/reservation-user.routes.js";
import adminReservationRoute from "./modules/reservations/reservation-admin.routes.js";
import authRoute from "./modules/auth/auth.routes.js";
import adminRoute from "./modules/admin/admin.routes.js";
import userProfileRoute from "./modules/users/user.routes.js";
import systemDataRoutes from "./modules/system-data/routes/index.js";

import userSecRoute from "./modules/users/user-security.routes.js";

// Start Express App
const app = express();
app.use(cors());
app.use(cookieParser());
app.use("/api/v1/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.static(path.join(process.cwd(), "uploads")));

// MIDDLEWARE FOR PARSING JSON REQUESTS
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(process.cwd(), "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
} else if (process.env.NODE_ENV === "testing") {
  app.use(morgan("test"));
  console.log(`mode: ${process.env.NODE_ENV} ⚒️`);
}

// MOUNT ROUTES
app.use("/api/v1/auth/", authRoute); // DONE
app.use("/api/v1/Myreservations/", userReservationRoute);
app.use("/api/v1/reservations/", adminReservationRoute);
app.use("/api/v1/admin/", adminRoute);
app.use("/api/v1/password/", userSecRoute);
app.use("/api/v1/myProfile/", userProfileRoute);
app.use("/api/v1/sysdata/", systemDataRoutes);

app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalError);

export default app;
