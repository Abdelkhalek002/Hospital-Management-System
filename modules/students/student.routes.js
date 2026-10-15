import express from "express";

import * as controller from "./student.controller.js";
import * as authMiddleware from "../../middlewares/auth.middleware.js";
import * as fileUploader from "../../middlewares/file-upload.middleware.js";
import { updateValidator } from "./student.validator.js";
import { restrictToUser, protect } from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";

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

// Users Management
router.use(
  authMiddleware.allowedTo(
    roles.SUPER_ADMIN,
    roles.SECOND_MANAGER,
    roles.MEDICAL_CHECK_MANAGER,
    roles.COUNTER,
    roles.OBSERVER,
    roles.TRANSFER_CLERK,
  ),
);

router.route("/").get(controller.getAll);
router
  .route("/:id")
  .get(controller.get)
  .patch(
    updateValidator,
    fileUploader.uploadAdminStudentFiles,
    fileUploader.resizeNationalIDFiles,
    fileUploader.resizeFeesFile,
    controller.update,
  );
export default router;
