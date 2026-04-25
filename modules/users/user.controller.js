import asyncHandler from "express-async-handler";
import db from "../../config/db.js";
import * as service from "./user.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const result = await service.getMe(user);
  res.status(StatusCode.OK).json({ status: "success", result });
});

//@desc user update profile data
//@route    POST  /api/v1/myProfile/:id
//@access   public
export const updateMe = asyncHandler(async (req, res) => {
  // 1. pick data
  const user = req.user;

  const allowedFields = [
    "username",
    "user_image_file",
    "birth_date",
    "gender",
    "gov_id",
  ];
  const data = pick(req.body, allowedFields);

  // 2. call service
  const result = await service.updateMe(user.id, data);

  // 3. send response
  res
    .status(StatusCode.OK)
    .json({ status: "success", msg: "Data updated successfully", result });
});
