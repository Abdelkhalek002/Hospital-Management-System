import express from "express";
const router = express.Router();

import { roles } from "../../utils/roles.js";
import * as controller from "../transfer/transfer.controller.js";
import * as authMiddleware from "../../middlewares/auth.middleware.js";

router
  .route("/")
  .post(
    authMiddleware.allowedToSuper,
    authMiddleware.allowedTo(
      roles.TRANSFER_CLERK,
      roles.EXTERNAL_HOSPITAL_ADMIN,
    ),
    controller.transfer,
  )
  .get(
    //authMiddleware.allowedTo(roles.EXTERNAL_HOSPITAL_ADMIN, roles.TRANSFER_CLERK),
    controller.getTransferred,
  );

router.route("/:id").patch(
  //authMiddleware.allowedTo(roles.TRANSFER_CLERK, roles.EXTERNAL_HOSPITAL_ADMIN),
  controller.updateTransfer,
);
export default router;
