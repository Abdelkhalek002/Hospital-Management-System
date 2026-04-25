import express from "express";

import * as userController from "./user.controller.js";

import * as fileUploader from "../../middlewares/file-upload.middleware.js";
import { updateMeValidator } from "./user.validator.js";
import { restrictToUser, protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect, restrictToUser);

router
  .route("/me")
  .get(userController.getMe)
  .patch(
    updateMeValidator,
    fileUploader.uploadProfilePhoto,
    fileUploader.resizeUserPhoto,
    userController.updateMe,
  );

export default router;
