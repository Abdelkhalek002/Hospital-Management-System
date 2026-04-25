import express from "express";

import * as userController from "./user.controller.js";
import { resizeImage, uploadUserImage } from "./upload/upload.service.js";
import { updateUserProfileValidator } from "./user.validator.js";
import { restrictToUser, protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect, restrictToUser);

router
  .route("/me")
  .get(userController.getMe)
  .put(updateUserProfileValidator, userController.updateMe)
  .patch(uploadUserImage, resizeImage, userController.updatePhoto);

export default router;
