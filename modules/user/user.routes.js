import express from "express";

import * as controller from "./user.controller.js";
import * as authMiddleware from "../../middlewares/auth.middleware.js";
import * as fileUploader from "../../middlewares/file-upload.middleware.js";
import { updateValidator } from "./user.validator.js";
import { restrictToUser, protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { permissions } from "../../utils/permissions.js";

const router = express.Router();

router.use(protect);

router
  .route("/me")
  .get(restrictToUser, controller.getMe)
  .put(
    restrictToUser,
    fileUploader.uploadProfilePhoto,
    fileUploader.resizeUserPhoto,
    updateValidator,
    controller.updateMe,
  );

// Users Management (Staff with USERS_READ permission)
router.use(hasPermission(permissions.USERS_READ));

router.route("/").get(controller.getAll);
router
  .route("/:id")
  .get(controller.get)
  .patch(
    hasPermission(permissions.USERS_WRITE),
    updateValidator,
    fileUploader.uploadAdminStudentFiles,
    fileUploader.resizeNationalIDFiles,
    fileUploader.resizeFeesFile,
    controller.update,
  );

export default router;

