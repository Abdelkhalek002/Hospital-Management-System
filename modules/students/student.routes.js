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
  .patch(
    restrictToUser,
    updateValidator,
    fileUploader.uploadProfilePhoto,
    fileUploader.resizeUserPhoto,
    controller.updateMe,
  );

// Users Management
router.use(
  authMiddleware.allowedTo(
    roles.SECOND_MANAGER,
    roles.MEDICAL_CHECK_MANAGER,
    roles.COUNTER,
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
