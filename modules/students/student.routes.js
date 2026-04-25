import express from "express";

import * as userController from "./student.controller.js";
import * as authMiddleware from "../../middlewares/auth.middleware.js";
import * as fileUploader from "../../middlewares/file-upload.middleware.js";
import { updateMeValidator } from "./student.validator.js";
import { restrictToUser, protect } from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";

const router = express.Router();

router.use(protect);

router
  .route("/me")
  .get(restrictToUser, userController.getMe)
  .patch(
    restrictToUser,
    updateMeValidator,
    fileUploader.uploadProfilePhoto,
    fileUploader.resizeUserPhoto,
    userController.updateMe,
  );

// Users Management
router.use(
  authMiddleware.allowedTo(
    roles.SECOND_MANAGER,
    roles.MEDICAL_CHECK_MANAGER,
    roles.COUNTER,
  ),
);

router.route("/").get(userController.getAll);
router
  .route("/:id")
  .get(
    userController.getOne,
    userController.updateOne,
    userController.deleteOne,
  );

export default router;
