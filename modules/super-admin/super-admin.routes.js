import express from "express";
import * as controller from "./super-admin.controller.js";
import {
  createAdminValidator,
  updateAdminValidator,
} from "./super-admin.validator.js";
import { protect, allowedTo } from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";

const router = express.Router();

//router.use(protect, allowedTo(roles.SUPER_ADMIN));

router
  .route("/")
  .post(createAdminValidator, controller.createOne)
  .get(controller.getAll);

router
  .route("/:id")
  .get(controller.getOne)
  .patch(updateAdminValidator, controller.updateOne)
  .delete(controller.deleteOne);

export default router;
