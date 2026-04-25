import asyncHandler from "express-async-handler";
import db from "../../config/db.js";
import * as service from "./student.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const result = await service.getMe(user);
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

export const getOne = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
});

export const getAll = asyncHandler(async (req, res) => {
  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit; // Calculate offset based on page and limit

  // Query to get the total count of students
  const countSql = "SELECT COUNT(*) AS count FROM students";
  db.query(countSql, (err, results) => {
    if (err) {
      console.error("Error fetching count of students:", err);
      return res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
    const countResults = results;
    const totalCount = countResults[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    let sql =
      "SELECT students.*, levels.levelName AS level_name, faculties.facultyName AS faculty_name,governorates.govName AS gov_name , nationality.nationalityName AS nationality_name FROM students";
    sql += " LEFT JOIN levels ON students.level_id = levels.level_id";
    sql += " LEFT JOIN governorates ON students.gov_id = governorates.gov_id";
    sql +=
      " LEFT JOIN nationality ON students.nationality_id = nationality.nationality_id";
    sql += " LEFT JOIN faculties ON students.faculty_id = faculties.faculty_id";
    sql += " LIMIT ? OFFSET ?";
    db.query(sql, [limit, offset], (err, students) => {
      if (err) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json(err);
      } else {
        console.info("request created successfully");
        res
          .status(StatusCode.OK)
          .json({ totalPages, currentPage: page, students });
      }
    });
  });
});

export const updateOne = asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  //check if user already exists
  const checkSql = "SELECT * FROM students WHERE student_id = ?";
  db.query(checkSql, [student_id], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(checkErr);
    }
    if (checkResult.length === 0) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "المستخدم غير موجود" });
    }
    const {
      userName,
      email,
      password,
      national_id,
      phone,
      address,
      level_id,
      gov_id,
      faculty_id,
    } = req.body;
    const updateSql = `UPDATE students SET userName = ?, email = ?, national_id = ?, phone = ?,  level_id = ?, gov_id = ? ,faculty_id WHERE student_id = ?`;
    //check if the national id is already exist
    const checkNationalId =
      "SELECT * FROM students WHERE national_id = ? AND student_id != ?";
    db.query(
      checkNationalId,
      [national_id, student_id],
      (checkNationalIdErr, checkNationalIdResult) => {
        if (checkNationalIdErr) {
          return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .send(checkNationalIdErr);
        }
        if (checkNationalIdResult.length > 0) {
          return res
            .status(StatusCode.CONFLICT)
            .json({ error: "الرقم القومي موجود بالفعل" });
        }
      },
    );
    db.query(
      updateSql,
      [
        userName,
        email,
        national_id,
        phone,
        level_id,
        gov_id,
        faculty_id,
        student_id,
      ],
      (err, result) => {
        if (err) {
          return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
        }
        return res
          .status(StatusCode.OK)
          .json({ message: "تم تعديل بيانات المستخدم بنجاح" });
      },
    );
  });
});

export const deleteOne = asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  const checkSql = "SELECT * FROM students WHERE student_id = ?";
  db.query(checkSql, [student_id], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(checkErr);
    }
    if (checkResult.length === 0) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "المستخدم غير موجود" });
    }
    const { userName } = checkResult[0];
    const deleteSql = "DELETE FROM students WHERE student_id = ?";
    db.query(deleteSql, [student_id], (deleteErr) => {
      if (deleteErr) {
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(deleteErr);
      }
      return res
        .status(StatusCode.OK)
        .json({ message: `تم حذف  ${userName} بنجاح`, student_id, userName });
    });
  });
});
