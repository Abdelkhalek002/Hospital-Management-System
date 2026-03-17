import express from "express";

import * as userController from "./user.controller.js";
import { updateUserProfileValidator } from "./user.validator.js";
import { Protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();
router
  .route("/:student_id")
  .get(Protect, userController.getUserProfile)
  .put(Protect, updateUserProfileValidator, userController.updateUserProfile)
  .patch(
    Protect,
    userController.uploadUserImage,
    userController.resizeImage,
    userController.updateProfilePhoto,
  );

export default router;
