import express from "express";

import * as userController from "./user.controller.js";
import { updateUserProfileValidator } from "./user.validator.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();
router
  .route("/:student_id")
  .get(protect, userController.getUserProfile)
  .put(protect, updateUserProfileValidator, userController.updateUserProfile)
  .patch(
    protect,
    userController.uploadUserImage,
    userController.resizeImage,
    userController.updateProfilePhoto,
  );

export default router;
