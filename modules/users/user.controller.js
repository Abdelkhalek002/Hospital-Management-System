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
    "phone_number",
    "level_id",
    "gov_id",
    "national_id",
  ];
  const data = pick(req.body, allowedFields);

  // 2. call service
  const result = await service.updateMe(user, data);

  // 3. send response
  res
    .status(StatusCode.OK)
    .json({ status: "success", msg: "Data updated successfully", result });
});

export const updatePhoto = asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  const { user_image_file } = req.body;
  const query = "UPDATE students SET user_image_file=? WHERE student_id=?";
  db.query(query, [user_image_file, student_id], (err, result) => {
    if (err) {
      console.error("Error updating user profile photo:", err);
      return res
        .status(500)
        .json({ message: "Error updating user profile photo" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }
    return res
      .status(200)
      .json({ message: "User profile photo updated successfully", result });
  });
});
