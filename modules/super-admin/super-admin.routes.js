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
  .post(createAdminValidator, controller.createOne)
  .get(controller.getAll);

router
  .route("/:id")
  .get(controller.getOne)
  .patch(controller.updateOne)
  .delete(controller.deleteOne);

export default router;
