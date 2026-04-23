import express from "express";
const router = express.Router();

import { roles } from "../../utils/roles.js";
import * as controller from "../transfer/transfer.controller.js";
import * as authMiddleware from "../../middlewares/auth.middleware.js";

router
  .route("/")
  .post(
    authMiddleware.allowedTo(roles.TRANSFER_CLERK, roles.BADR_HOSPITAL_ADMIN),
    authMiddleware.allowedToSuper,
    controller.transfer,
  );

router.route("/index").post(
  //authMiddleware.allowedTo(roles.BADR_HOSPITAL_ADMIN, roles.TRANSFER_CLERK),
  controller.getTransferred,
);
router
  .route("/:transfer_id")
  .put(
    authMiddleware.allowedTo(roles.TRANSFER_CLERK, roles.BADR_HOSPITAL_ADMIN),
    controller.updateTransfer,
  );
export default router;
