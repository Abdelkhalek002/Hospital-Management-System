import path from "path";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
//import redis from "redis";
import cors from "cors";

import ApiError from "./utils/apiError.js";
import globalError from "./middlewares/errorMiddleware.js";

// ROUTES
import userReservationRoute from "./routes/UserReservationRoute.js";
import adminReservationRoute from "./routes/AdminReservationRoute.js";
import authRoute from "./modules/auth/auth.routes.js";
import adminCrudRoute from "./routes/AdminCrudRoute.js";
import userProfileRoute from "./routes/userProfileRoute.js";

// System data routes
import levelsRoute from "./routes/systemDataRoutes/levelsRoute.js";
import govsRoute from "./routes/systemDataRoutes/govsRoute.js";
import clinicsRoute from "./routes/systemDataRoutes/clinicsRoute.js";
import facultyRoute from "./routes/systemDataRoutes/facultyRoute.js";
import hospRoute from "./routes/systemDataRoutes/hospRoute.js";

import userSecRoute from "./routes/userSecRoute.js";

// Start Express App
const app = express();
app.use(cors());
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
app.use("/api/v1/admin/", adminCrudRoute);
app.use("/api/v1/password/", userSecRoute);
app.use("/api/v1/myProfile/", userProfileRoute);
app.use(
  "/api/v1/sysdata/",
  levelsRoute,
  govsRoute,
  clinicsRoute,
  facultyRoute,
  hospRoute,
);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalError);

export default app;
