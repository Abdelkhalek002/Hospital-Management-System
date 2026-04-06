import express from "express";
import * as controller from "./super-admin.controller.js";
import { createAdminValidator } from "./super-admin.validator.js";
import { Protect, allowedTo } from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";
const router = express.Router();

router.use(Protect, allowedTo(roles.SUPER_ADMIN));

router.route("/add").post(createAdminValidator, controller.createSuperAdmin);
export default router;
