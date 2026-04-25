import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import db from "../../config/db.js";
import { StatusCode } from "../../utils/status-codes.js";
import { roles } from "../../utils/roles.js";
import * as service from "./admin.service.js";
import Base from "../../repositories/base.repository.js";

// System Stats
export const getStatistics = asyncHandler(async (req, res) => {
  const result = await new Base().getStats();
  res.status(StatusCode.OK).json({
    msg: "success",
    data: result,
  });
});

//@desc     view all user profiles
//@route    GET  /api/v1/admin
//@access   private
export const getAllUserProfiles = asyncHandler(async (req, res) => {
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

//@desc     add students
//@route    POST  /api/v1/admin
//@access   private
export const addStudent = asyncHandler(async (req, res) => {
  const {
    userName,
    email,
    password,
    national_id,
    phone,
    level_id,
    gov_id,
    faculty_id,
  } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const checkSql = "SELECT * FROM students WHERE national_id = ?";
  db.query(checkSql, [national_id], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(checkErr);
    }
    if (checkResult.length > 0) {
      return res
        .status(StatusCode.CONFLICT)
        .json({ error: "الرقم القومي موجود بالفعل" });
    }
    const insertSql =
      "INSERT INTO students (userName, email, password, national_id, phone, address, level_id, gov_id, faculty_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      insertSql,
      [
        userName,
        email,
        hashedPassword,
        national_id,
        phone,
        address,
        level_id,
        gov_id,
        faculty_id,
      ],
      (err, result) => {
        if (err) {
          return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
        }
        return res
          .status(StatusCode.CREATED)
          .json({ message: "تم اضافة الطالب بنجاح" });
      },
    );
  });
});

//@desc     update user profiles
//@route    GET  /api/v1/admin
//@access   private
export const updateUserProfile = asyncHandler(async (req, res) => {
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

//@desc     delete user profiles
//@route    GET  /api/v1/admin
//@access   private
export const deleteUserProfile = asyncHandler(async (req, res) => {
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

//search for students method
export const searchStudent = asyncHandler(async (req, res) => {
  const { searchKey } = req.query;
  const sql =
    "SELECT * FROM students WHERE userName LIKE ? OR national_id LIKE ?";
  db.query(sql, [`%${searchKey}%`, `%${searchKey}%`], (err, results) => {
    if (err) {
      res.status(400).json({ msg: err.message });
    } else {
      if (results.length === 0) {
        res.status(404).json({ msg: "No students found" });
      } else {
        res.status(200).json({ data: results });
      }
    }
  });
});

//advanced search method
export const advancedSearch = asyncHandler(async (req, res) => {
  const queryParams = [];
  let query = `
  SELECT students.*, medical_examinations.*, clinics.clinicName AS clinic_name
  FROM students
  LEFT JOIN medical_examinations ON students.student_id = medical_examinations.student_id
  LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.clinic_id
  WHERE`;
  let conditions = [];

  // Build the WHERE clause for the search query
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== "page" && key !== "limit" && value) {
      // Skip pagination params
      conditions.push(`${key} LIKE ?`);
      queryParams.push(`%${value}%`);
    }
  }

  // Check if any search criteria provided
  if (conditions.length === 0) {
    return res.status(StatusCode.NOT_FOUND).json({
      message: "لا يوجد عنصر للبحث . برجاء اختيار عنصر واحد علي الاقل",
    });
  }
  query += " " + conditions.join(" AND ");

  query += " ORDER BY medical_examinations.id DESC";

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  // Query to get the total count of results matching the search criteria
  const countQuery = `
  SELECT COUNT(*) AS count
  FROM students
  LEFT JOIN medical_examinations ON students.student_id = medical_examinations.student_id
  WHERE ${conditions.join(" AND ")}`;

  db.query(countQuery, queryParams, (err, countResults) => {
    if (err) {
      return res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Database error", error: err });
    }

    const totalCount = countResults[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    // Add pagination to the main query
    query += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // Execute the search query with pagination
    db.query(query, queryParams, (err, search) => {
      if (err) {
        return res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: "Database error", error: err });
      }

      // Handle the response
      if (search.length === 0) {
        return res
          .status(StatusCode.NOT_FOUND)
          .json({ msg: "لا يوجد نتائج بحث" });
      } else {
        // Format the dates
        const formattedResults = search.map((result) => {
          if (result.date) {
            result.date = new Date(result.date).toLocaleString("en-US", {
              timeZone: "Africa/Cairo",
            });
          }
          if (result.birth_date) {
            result.birth_date = new Date(result.birth_date).toLocaleString(
              "en-US",
              { timeZone: "Africa/Cairo" },
            );
          }
          return result;
        });

        // Send the response
        return res
          .status(200)
          .json({ totalPages, currentPage: page, data: formattedResults });
      }
    });
  });
});

//filter students method
export const filterStudents = asyncHandler(async (req, res) => {
  const filters = req.query;
  const values = [];
  const conditions = [];

  Object.entries(filters).forEach(([key, value]) => {
    conditions.push(`students.${key} = ?`);
    values.push(value);
  });

  let sql =
    "SELECT students.*, levels.levelName AS level_name, governorates.govName AS gov_name , nationality.nationalityName AS nationality_name FROM students";
  sql += " LEFT JOIN levels ON students.level_id = levels.level_id";
  sql += " LEFT JOIN governorates ON students.gov_id = governorates.gov_id";
  sql +=
    " LEFT JOIN nationality ON students.nationality_id = nationality.nationality_id";

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  db.query(sql, values, (err, results) => {
    if (err) {
      res.status(400).json({ msg: err.message });
    } else {
      if (!results || results.length === 0) {
        res.status(404).json({ msg: "No students found" });
      } else {
        res.status(200).json({ data: results });
      }
    }
  });
});

// Search with multiple fields
export const reservationSearch = asyncHandler(async (req, res) => {
  const { searchKey } = req.query;
  const sql =
    "SELECT * FROM medical_examinations WHERE examType LIKE ? OR status LIKE ? OR transfered LIKE ? ";
  db.query(
    sql,
    [`%${searchKey}%`, `%${searchKey}%`, `%${searchKey}%`, `%${searchKey}%`],
    (err, results) => {
      if (err) {
        res.status(400).json({ msg: err.message });
      } else {
        if (results.length === 0) {
          res.status(404).json({ msg: "No students found" });
        } else {
          res.status(200).json({ data: results });
        }
      }
    },
  );
});

// Search students with multiple fields
export const studentSearch = asyncHandler(async (req, res) => {
  const { searchKey } = req.query;
  const sql = `
  SELECT 
      * 
  FROM 
      students 
  WHERE 
      userName LIKE ? 
      OR email LIKE ? 
      OR national_id LIKE ? 
      OR nationality_id LIKE ? 
      OR level_id LIKE ? 
      OR gov_id LIKE ? 
      OR faculty_id LIKE ? 
      OR phone_number LIKE ?
`;
  db.query(
    sql,
    [
      `%${searchKey}%`,
      `%${searchKey}%`,
      `%${searchKey}%`,
      `%${searchKey}%`,
      `%${searchKey}%`,
      `%${searchKey}%`,
      `%${searchKey}%`,
      `%${searchKey}%`,
    ],
    (err, results) => {
      if (err) {
        res.status(400).json({ msg: err.message });
      } else {
        if (results.length === 0) {
          res.status(404).json({ msg: "No students found" });
        } else {
          res.status(200).json({ data: results });
        }
      }
    },
  );
});
