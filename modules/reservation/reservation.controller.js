//IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";
import db from "../../config/db.js";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import sanitizeFilename from "sanitize-filename";
import { isLimitReached } from "./reservation.validator.js";
import { StatusCode } from "../../utils/status-codes.js";
import { auditLog } from "../../utils/audit-log.js";
import { roles } from "../../utils/roles.js";
import Reservation from "./reservation.repository.js";
import * as service from "./resrervation.service.js";

//!Emergency Reservations routes
//@desc     submit medical examination request
//@route    POST  /api/v1/Reservations
//@access   private
export const adminCreateRequest = asyncHandler(async (req, res) => {
  const {
    Name,
    national_id,
    level_id,
    clinic_id,
    gov_id,
    faculty_id,
    nationality_id,
  } = req.body;

  const sql =
    "INSERT INTO emergency_reservations (Name,national_id,level_id,clinic_id,gov_id,faculty_id,nationality_id) VALUES (?, ?,?,?,?,?,?)";
  db.query(
    sql,
    [
      Name,
      national_id,
      level_id,
      clinic_id,
      gov_id,
      faculty_id,
      nationality_id,
    ],
    (err, result) => {
      if (err) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
      } else {
        console.log("Request created successfully");
        // Insert audit record
        const isSuperAdmin = req.user[0].role === roles.SUPER_ADMIN; // Check if the user is a super admin

        const auditData = {
          timestamp: new Date().toISOString(),
          method: "حجز كشف عاجل",
          body: {
            Name,
            national_id,
            level_id,
            clinic_id,
            gov_id,
            faculty_id,
            nationality_id,
          },
          admin_id: isSuperAdmin
            ? req.user[0].superAdmin_id
            : req.user[0].user_id,
          adminName: isSuperAdmin ? req.user[0].name : req.user[0].userName,
        };
        const auditSql =
          "INSERT INTO admin_log (admin_id, admin_name, timestamp, method, body) VALUES (?, ?, ?, ?, ?)";
        db.query(auditSql, [
          auditData.admin_id,
          auditData.adminName,
          auditData.timestamp,
          auditData.method,
          JSON.stringify(auditData.body),
        ]);
        res.status(StatusCode.OK).json({ message: "تم الحجز بنجاح" });
      }
    },
  );
});

//@desc     modify medical examination request
//@route    PUT  /api/v1/Reservations/:emergencyUser_id
//@access   private
export const adminUpdateRequest = asyncHandler(async (req, res) => {
  const { emergencyUser_id } = req.params;
  const {
    Name,
    national_id,
    level_id,
    clinic_id,
    gov_id,
    faculty_id,
    nationality_id,
  } = req.body;

  const checkSql =
    "SELECT * FROM emergency_reservations WHERE emergencyUser_id = ?";
  db.query(checkSql, [emergencyUser_id], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(checkErr);
    }
    if (checkResult.length === 0) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "Emergency Reservation ID not found" });
    }

    const updateSql = `
      UPDATE emergency_reservations 
      SET Name = ?, national_id = ?, level_id = ?, clinic_id = ?, gov_id = ?, faculty_id = ?, nationality_id = ?
      WHERE emergencyUser_id = ?
    `;
    db.query(
      updateSql,
      [
        Name,
        national_id,
        level_id,
        clinic_id,
        gov_id,
        faculty_id,
        nationality_id,
        emergencyUser_id,
      ],
      (err, result) => {
        if (err) {
          return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
        } else {
          res.status(StatusCode.OK).json({
            message: "تم تعديل الحجز بنجاح",
          });

          const isSuperAdmin = req.user[0].role === roles.SUPER_ADMIN; // Check if the user is a super admin

          const auditData = {
            timestamp: new Date().toISOString(),
            method: "تعديل حجز كشف عاجل",
            body: {
              emergencyUser_id,
              Name,
              national_id,
              level_id,
              clinic_id,
              gov_id,
              faculty_id,
              nationality_id,
            },
            admin_id: isSuperAdmin
              ? req.user[0].superAdmin_id
              : req.user[0].user_id,
            adminName: isSuperAdmin ? req.user[0].name : req.user[0].userName,
          };
          const auditSql = `
            INSERT INTO admin_log (admin_id, admin_name, timestamp, method, body) 
            VALUES (?, ?, ?, ?, ?)
          `;
          db.query(
            auditSql,
            [
              auditData.admin_id,
              auditData.adminName,
              auditData.timestamp,
              auditData.method,
              JSON.stringify(auditData.body),
            ],
            (auditErr, auditResult) => {
              if (auditErr) {
                console.error("Error creating audit record:", auditErr);
                return res
                  .status(StatusCode.SERVICE_UNAVAILABLE)
                  .send(auditErr);
              }
              console.log("Audit record created successfully:", auditResult);
            },
          );
        }
      },
    );
  });
});

//@desc     view medical examination request
//@route    GET  /api/v1/Reservations/:emergencyUser_id
//@access   private
export const adminViewRequest = asyncHandler(async (req, res) => {
  const emergencyUser_id = req.params.emergencyUser_id;
  const sql = "SELECT * FROM emergency_reservations WHERE emergencyUser_id = ?";
  db.query(sql, [emergencyUser_id], (err, results) => {
    if (err) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    } else {
      res.status(StatusCode.OK).json(results);
    }
  });
});

//@desc     view list of medical examinations
//@route    GET  /api/v1/Reservations
//@access   private
export const adminGetAllReservations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const searchKey = req.query.searchKey || "";
  const offset = (page - 1) * limit;

  const searchParam = `%${searchKey}%`;
  const countSql = `
      SELECT COUNT(*) AS count 
      FROM medical_examinations 
      LEFT JOIN students ON medical_examinations.student_id = students.id 
      LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
      LEFT JOIN levels ON students.level_id = levels.id
      WHERE 
          medical_examinations.exam_type LIKE ? 
          OR medical_examinations.status LIKE ? 
          OR students.username LIKE ? 
          OR students.email LIKE ? 
          OR students.national_id LIKE ? 
          OR students.nationality_id LIKE ? 
          OR students.level_id LIKE ? 
          OR students.gov_id LIKE ? 
          OR students.faculty_id LIKE ? 
          OR students.phone_number LIKE ?
          OR clinics.clinic_name LIKE ?
          OR levels.level_name LIKE ?
  `;

  const sql = `
      SELECT 
          medical_examinations.*,  
          clinics.clinic_name AS clinic_name, 
          levels.level_name AS level_name,
          students.username AS student_name,
          students.user_image_file,
          students.national_id_file AS national_id_img,
          students.fees_file AS fees_file,
          students.email AS student_email,
          students.national_id AS national_id,
          transfers.id AS transfer_id,
          external_hospitals.hospital_name AS transfered_to,
          transfers.transfer_reason AS transferReason,
          transfers.notes

      FROM 
          medical_examinations 
          LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
          LEFT JOIN students ON medical_examinations.student_id = students.id
          LEFT JOIN levels ON students.level_id = levels.id
          LEFT JOIN transfers ON medical_examinations.id = transfers.medical_exam_id
          LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id

      WHERE 
          medical_examinations.exam_type LIKE ? 
          OR medical_examinations.status LIKE ? 
          OR students.username LIKE ? 
          OR students.email LIKE ? 
          OR students.national_id LIKE ? 
          OR students.nationality_id LIKE ? 
          OR students.level_id LIKE ? 
          OR students.gov_id LIKE ? 
          OR students.faculty_id LIKE ? 
          OR students.phone_number LIKE ?
          OR clinics.clinic_name LIKE ?
          OR levels.level_name LIKE ?
      ORDER BY
          medical_examinations.id DESC
      LIMIT ? OFFSET ?
  `;

  const searchConditions = Array(12).fill(searchParam);

  const [countResults] = await db.query(countSql, searchConditions);
  const totalCount = countResults[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const [results] = await db.query(sql, [...searchConditions, limit, offset]);

  // converting the time-zone to Cairo time-zone
  results.forEach((result) => {
    if (result.date) {
      result.date = new Date(result.date).toLocaleString("en-US", {
        timeZone: "Africa/Cairo",
      });
    }
  });

  return res.status(StatusCode.OK).json({
    totalPages,
    currentPage: page,
    results,
  });
});

//@desc     view list of emergency medical examinations
//@route    GET  /api/v1/EmergencyReservations
//@access   private
export const adminGetAllEmergencyReservations = asyncHandler(
  async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit; // Calculate offset based on page and limit

    // Query to get the total count of medical examinations
    const countSql = "SELECT COUNT(*) AS count FROM emergency_reservations";
    db.query(countSql, (err, results) => {
      if (err) {
        console.error("Error fetching count of emergency examinations:", err);
        return res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal Server Error" });
      }
      const countResults = results;
      const totalCount = countResults[0].count;
      const totalPages = Math.ceil(totalCount / limit);

      let sql = `
    SELECT 
      emergency_reservations.*,  
      clinics.clinicName AS clinic_name,
      levels.levelName AS level_name,
      faculties.facultyName AS faculty_name,
      governorates.govName AS gov_name,
      nationality.nationalityName AS Nationlaity
    FROM 
      emergency_reservations 
      LEFT JOIN clinics ON emergency_reservations.clinic_id = clinics.clinic_id
      LEFT JOIN levels ON emergency_reservations.level_id = levels.level_id
      LEFT JOIN faculties ON emergency_reservations.faculty_id = faculties.faculty_id
      LEFT JOIN governorates ON emergency_reservations.gov_id = governorates.gov_id
      LEFT JOIN Nationality ON emergency_reservations.nationality_id =nationality.nationality_id
      ORDER BY
    emergency_reservations.emergencyUser_id DESC
    LIMIT ? OFFSET ?`;

      // Execute the SQL query with limit and offset parameters
      db.query(sql, [limit, offset], (error, results) => {
        if (error) {
          console.error("Error fetching emergency examinations data:", error);
          return res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json({ error: "Internal Server Error" });
        } else {
          results.map((result) => {
            result.time = new Date(result.time).toLocaleString("en-US", {
              timeZone: "Africa/Cairo",
            });
            return result;
          });
          // Examinations found, return them
          res.status(StatusCode.OK).json({
            totalPages,
            currentPage: page,
            results,
          });
        }
      });
    });
  },
);

//@desc     delete medical examination request
//@route    DELETE  /api/v1/Reservations/:emergencyUser_id
//@access   private
export const adminDeleteRequest = asyncHandler(async (req, res) => {
  const emergencyUser_id = req.params.emergencyUser_id;

  const checkSql =
    "SELECT * FROM emergency_reservations WHERE emergencyUser_id = ?";
  db.query(checkSql, [emergencyUser_id], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(checkErr);
    }
    if (checkResult.length === 0) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "الكشف غير موجود " });
    }

    const deleteSql =
      "DELETE FROM emergency_reservations WHERE emergencyUser_id = ?";
    db.query(deleteSql, [emergencyUser_id], (err, result) => {
      if (err) {
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
      }

      const isSuperAdmin = req.user[0].role === roles.SUPER_ADMIN; // Check if the user is a super admin

      const auditData = {
        timestamp: new Date().toISOString(),
        method: "حذف حجز كشف عاجل",
        body: {
          emergencyUser_id: emergencyUser_id,
          deletedCount: result.affectedRows,
        },
        admin_id: isSuperAdmin
          ? req.user[0].superAdmin_id
          : req.user[0].user_id,
        adminName: isSuperAdmin ? req.user[0].name : req.user[0].userName,
      };

      const auditSql =
        "INSERT INTO admin_log (admin_id, admin_name, timestamp, method, body) VALUES (?, ?, ?, ?, ?)";
      db.query(
        auditSql,
        [
          auditData.admin_id,
          auditData.adminName,
          auditData.timestamp,
          auditData.method,
          JSON.stringify(auditData.body),
        ],
        (auditErr, auditResult) => {
          if (auditErr) {
            console.error("Error creating audit record:", auditErr);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(auditErr);
          }
          console.log("Audit record created successfully:", auditResult);
          res.status(StatusCode.OK).json({ message: "تم حذف الحجز بنجاح" });
        },
      );
    });
  });
});

//--------------------------------------------------------------------------------------------------------------

//@desc     submit medical examination request
//@route    POST  /api/v1/myreservations
//@access   public
export const createRequest = asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  const { clinic_id, date, examType } = req.body;

  // 1- check if reservation limit reached
  const [results] = await db.query(
    "SELECT * FROM medical_examinations WHERE date = ?",
    [date],
  );
  if (isLimitReached(null, results)) {
    return res
      .status(StatusCode.BAD_REQUEST)
      .json({ error: "reservations limit reached!" });
  }

  // check if user exceeded limit of 1 reservation per day
  const [limitResult] = await db.query(
    "SELECT COUNT(*) AS count FROM medical_examinations WHERE student_id = ? AND date = ?",
    [student_id, date],
  );

  if (limitResult[0]?.count >= 1) {
    return res
      .status(StatusCode.TOO_MANY_REQUESTS)
      .json({ error: "تجاوزت الحد الاقصى للحجوزات اليومية" });
  }

  // 2- check if user exists
  const [students] = await db.query(
    "SELECT * FROM students WHERE id = ?",
    [student_id],
  );
  if (!students || students.length === 0) {
    return res
      .status(StatusCode.BAD_REQUEST)
      .json({ error: `المستخدم ${student_id} غير موجود` });
  }

  // 3- insert reservation
  const sql =
    "INSERT INTO medical_examinations (student_id, clinic_id, date, exam_type) VALUES (?, ?, ?, ?)";
  await db.query(sql, [student_id, clinic_id, date, examType]);

  return res
    .status(StatusCode.CREATED)
    .json({ message: "تم حجز الكشف بنجاح" });
});

//@desc     modify medical examination request
//@route    PUT  /api/v1/myreservations
//@access   public
export const updateRequest = asyncHandler(async (req, res) => {
  const { medicEx_id } = req.params;
  const { clinic_id, date, examType } = req.body;

  const [results] = await db.query(
    "SELECT * FROM medical_examinations WHERE id = ?",
    [medicEx_id],
  );
  if (!results || results.length === 0) {
    return res.status(StatusCode.NOT_FOUND).json({
      error: `الكشف رقم ${medicEx_id} غير موجود`,
    });
  }

  const sql =
    "UPDATE medical_examinations SET clinic_id = ?, date = ?, exam_type = ? WHERE id = ?";
  await db.query(sql, [clinic_id, date, examType, medicEx_id]);

  return res
    .status(StatusCode.CREATED)
    .json({ message: "تم تعديل الحجز بنجاح", medicEx_id });
});

//@desc     view medical examination request
//@route    GET  /api/v1/myreservations
//@access   public
export const viewRequest = asyncHandler(async (req, res) => {
  const { medicEx_id } = req.params;
  const sql = `
    SELECT 
      medical_examinations.*,  
      clinics.clinic_name AS clinic_name
    FROM 
      medical_examinations 
      LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
    WHERE 
      medical_examinations.id = ?`;

  const [results] = await db.query(sql, [medicEx_id]);
  if (!results || results.length === 0) {
    return res.status(StatusCode.NOT_FOUND).json({
      error: `الكشف رقم ${medicEx_id} غير موجود`,
    });
  }

  return res.status(StatusCode.OK).json(results);
});

//@desc     view all my medical examinations
//@route    GET  /api/v1/myreservations
//@access   public
export const getMyReservations = asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const countSql =
    "SELECT COUNT(*) AS count FROM medical_examinations WHERE student_id = ?";
  const [countResults] = await db.query(countSql, [student_id]);
  const totalCount = countResults[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const sql = `
    SELECT 
      medical_examinations.*,  
      clinics.clinic_name AS clinic_name, 
      students.username AS student_name,
      transfers.transfer_reason AS transferReason,
      transfers.notes,
      external_hospitals.hospital_name AS ex_hosp_name
    FROM 
      medical_examinations 
      LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
      LEFT JOIN students ON medical_examinations.student_id = students.id
      LEFT JOIN transfers ON medical_examinations.id = transfers.medical_exam_id
      LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
    WHERE 
      medical_examinations.student_id = ?
    ORDER BY
      medical_examinations.id DESC
    LIMIT ? OFFSET ?`;

  const [results] = await db.query(sql, [student_id, limit, offset]);

  if (!results || results.length === 0) {
    return res
      .status(StatusCode.BAD_REQUEST)
      .json({ error: "Student has no examination record!" });
  }

  results.forEach((result) => {
    if (result.date) {
      result.date = new Date(result.date).toLocaleString("en-US", {
        timeZone: "Africa/Cairo",
      });
    }
  });

  return res.status(StatusCode.OK).json({
    totalPages,
    currentPage: page,
    results,
  });
});

//! Cancel req only if its not already accepted
export const cancelRequest = asyncHandler(async (req, res) => {
  const { medicEx_id } = req.params;
  const isExitQuery = "SELECT * FROM medical_examinations WHERE id = ?";
  const [result] = await db.query(isExitQuery, [medicEx_id]);

  if (!result || result.length === 0) {
    return res
      .status(StatusCode.NOT_FOUND)
      .json({ error: "الكشف غير موجود" });
  }

  if (result[0].status === "مقبول") {
    return res
      .status(StatusCode.BAD_REQUEST)
      .json({ error: "لا يمكن الغاء الكشف لانه تم قبوله" });
  }

  const deleteQuery = "DELETE FROM medical_examinations WHERE id = ?";
  await db.query(deleteQuery, [medicEx_id]);

  return res
    .status(StatusCode.OK)
    .json({ message: "تم الغاء الكشف بنجاح" });
});

// Get the number of reservations by each month from the beginning of the year
export const getReservationsPerMonth = asyncHandler(async (req, res) => {
  const months = await new Reservation().getPerMonth();
  res.status(StatusCode.OK).json({
    msg: "success",
    data: months,
  });
});

// accept reservation or decline it
export const isAccepted = asyncHandler(async (req, res) => {
  //1. get data
  const { id } = req.params;
  const { operation } = req.body;
  // 2. call service
  const accepted = await service.isAccepted(id, operation);

  // 3. record action
  const auditData = {
    adminId: req.user.id,
    method: accepted ? "قبول طلب كشف" : "رفض طلب كشف",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);
  // 4. send response

  return res.status(StatusCode.OK).json({
    message: accepted ? "تم قبول الكشف" : "تم رفض الكشف",
  });
});
