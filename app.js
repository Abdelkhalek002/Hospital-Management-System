import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./utils/api-error.js";
import globalError from "./middlewares/error.middleware.js";

// ROUTES
import userReservationRoute from "./modules/reservation/reservation-user.routes.js";
import adminReservationRoute from "./modules/reservation/reservation-admin.routes.js";
import authRoute from "./modules/auth/auth.routes.js";
import adminRoute from "./modules/admin/admin.routes.js";
import superAdminRoute from "./modules/super-admin/super-admin.routes.js";
import studentRoute from "./modules/students/student.routes.js";
import systemDataRoutes from "./modules/system-data/system-data.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start Express App
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser());
app.use("/api/v1/uploads", express.static(path.join(process.cwd(), "uploads")));

// 1) GLOBAL MIDDLEWARES
// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(bodyParser.json());

// Serving static files
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
} else if (process.env.NODE_ENV === "testing") {
  app.use(morgan("test"));
  console.log(`mode: ${process.env.NODE_ENV} ⚒️`);
}

// MOUNT ROUTES
app.use("/api/v1/auth/", authRoute); // DONE
app.use("/api/v1/super-admins/", superAdminRoute); // DONE
app.use("/api/v1/admins/", adminRoute);
app.use("/api/v1/reservations/", adminReservationRoute);
app.use("/api/v1/users/", studentRoute);
app.use("/api/v1/Myreservations/", userReservationRoute);
app.use("/api/v1/sysdata/", systemDataRoutes);

app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalError);

export default app;
