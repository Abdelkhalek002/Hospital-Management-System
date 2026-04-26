import asyncHandler from "express-async-handler";
import db from "../../config/db.js";
import * as service from "./student.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";
import ApiError from "../../utils/api-error.js";

export const getMe = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const result = await service.get(id);
  res.status(StatusCode.OK).json({ status: "success", result });
});

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

export const getAll = asyncHandler(async (req, res) => {
  // 1. check if search key is valid
  let allowedKeys = ["username", "email", "national_id", "phone_number"];
  let searchKey, searchValue;
  const entries = Object.entries(req.query);

  if (entries.length > 0) {
    let [searchKey, searchValue] = entries[0];
  }

  searchKey = pick(req.query, allowedKeys);

  const result = await service.getAll(searchKey, searchValue);
  res.status(StatusCode.OK).json({ status: "success", result });
});

export const get = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await service.get(id);
  res.status(StatusCode.OK).json({ status: "success", result });
});

export const update = asyncHandler(async (req, res) => {
  // 1. pick data from req
  const { id } = req.params;
  const allowedFields = [
    "national_id",
    "phone_number",
    "faculty_id",
    "level_id",
    "nationality_id",
    "national_id_file",
    "fees_file",
  ];
  const data = pick(req.body, allowedFields);

  // 2. call service
  const done = await service.update(id, data);

  // 3. send response
  return res
    .status(StatusCode.OK)
    .json({ message: "تم تعديل بيانات المستخدم بنجاح" });
});
