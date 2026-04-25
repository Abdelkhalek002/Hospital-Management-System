import express from "express";
import * as controller from "./super-admin.controller.js";
import { createAdminValidator } from "./super-admin.validator.js";
import { protect, restrictToUser } from "../../middlewares/auth.middleware.js";
import { UserType } from "../../utils/user-types.js";
import { roles } from "../../utils/roles.js";
const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(createAdminValidator, controller.createSuperAdmin)
  .get(controller.getAllAdmin);

router.route("/addAdmin").post(controller.addNewAdmin);

router
  .route("/:user_id")
  .get(controller.viewAdmin)
  .put(controller.updateAdmin)
  .delete(controller.deleteAdmin);

// ADMIN LOG ROUTERS
router
  .route("/logs")
  .get(controller.getAdminLogs)
  .delete(controller.clearHistory);

router
  .route("/logs/:admin_id")
  .get(controller.getSpecificAdminLogs)
  .delete(controller.clearSpecificHistory);

export default router;
