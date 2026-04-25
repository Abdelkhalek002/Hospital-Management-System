import express from "express";
const router = express.Router();

import { roles } from "../../utils/roles.js";
import * as controller from "../transfer/transfer.controller.js";
import * as authMiddleware from "../../middlewares/auth.middleware.js";

router.route("/").post(controller.transfer).get(controller.getTransferred);

router.route("/:id").patch(controller.updateTransfer);
export default router;
