import express from "express";

import * as userController from "./user.controller.js";
import { resizeImage, uploadUserImage } from "./upload/upload.service.js";
import * as fileUploader from "../../middlewares/file-upload.service.js";
import { updateMeValidator } from "./user.validator.js";
import { restrictToUser, protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect, restrictToUser);

router.route("/me").get(userController.getMe).patch(
  updateMeValidator,
  fileUploader.uploadProfilePhoto,
  fileUploader.resizeUserPhoto,
  //uploadUserImage,
  //resizeImage,
  userController.updateMe,
);

export default router;
