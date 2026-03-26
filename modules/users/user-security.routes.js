import express from "express";
import { changeUserPassword } from "./user-security.controller.js";
import limiter from "../../shared/services/rate-limit.service.js";

const router = express.Router();

router.route("/change/:student_id").post(limiter, changeUserPassword);

export default router;
