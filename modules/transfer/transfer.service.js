import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

import db from "../../config/db.js";
import Base from "../../repositories/base.repository.js";
import Transfer from "./transfer.repository.js";
import MedicalExamination from "../medical-examination/medical-examination.repository.js";
import sendObservationMail from "../admin/admin.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { roles } from "../../utils/roles.js";
import ApiError from "../../utils/api-error.js";

export const transfer = async (data) => {
  // 1. Check if the medical examination status is 'مقبول'
  const medical_exam_accepted = await new MedicalExamination().isAccepted(
    data.medical_exam_id,
  );

  if (!medical_exam_accepted) {
    throw new ApiError(
      "Medical examination not accepted!",
      StatusCode.CONFLICT,
    );
  }

  //2. check if hospital id exists
  const hospitalResult = await new Base().findById(
    "external_hospitals",
    data.hospital_id,
  );
  if (!hospitalResult)
    throw new ApiError("Invalid hospital data", StatusCode.NOT_FOUND);

  // 4. Insert transfer record
  const result = await new Transfer(
    data.medical_exam_id,
    data.hospital_id,
    data.transfer_reason,
    data.notes,
  ).create();
  return result;
};

export const getTransferred = async ({ page, limit, searchKey }) => {
  // 1. intialize search param
  const offset = (page - 1) * limit;
  const searchParam = `%${searchKey}%`;
  // 2. database WHERE
  const whereClause = `
    medical_examinations.status = "مقبول" AND (
      medical_examinations.exam_type LIKE ? OR 
      medical_examinations.status LIKE ? OR 
      students.username LIKE ? OR 
      students.email LIKE ? OR 
      students.national_id LIKE ? OR 
      students.phone_number LIKE ? OR
      clinics.clinic_name LIKE ? OR
      levels.level_name LIKE ? OR
      transfers.transfer_reason LIKE ? OR
      transfers.notes LIKE ? OR
      external_hospitals.hospital_name LIKE ?
    )
  `;

  // 3. params
  const params = Array(11).fill(searchParam);

  const countSql = `
    SELECT COUNT(*) AS count 
    FROM medical_examinations 
    LEFT JOIN students ON medical_examinations.student_id = students.id 
    LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
    LEFT JOIN levels ON students.level_id = levels.id
    LEFT JOIN transfers ON transfers.medical_exam_id = medical_examinations.id 
    LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
    WHERE ${whereClause}
  `;

  const dataSql = `
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
      transfers.transfer_reason,
      transfers.notes
    FROM 
      medical_examinations 
      LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.clinic_id
      LEFT JOIN students ON medical_examinations.student_id = students.student_id
      LEFT JOIN levels ON students.level_id = levels.level_id
      LEFT JOIN transfers ON transfers.medical_exam_id = medical_examinations.id
      LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
    WHERE ${whereClause}
    ORDER BY
      medical_examinations.id DESC
    LIMIT ? OFFSET ?
  `;

  // 4. Get the total count of records matching the search criteria
  db.query(countSql, [params], (err, countResults) => {
    if (err) {
      console.error("Error fetching count of examinations:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const totalCount = countResults[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    // Check if totalCount is empty
    if (!totalCount) {
      return res.status(404).json({ msg: "No examinations found" });
    }

    // Get the paginated results with search criteria
    db.query(dataSql, [...params, limit, offset], (error, results) => {
      if (error) {
        console.error("Error fetching examination data:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Converting the time-zone to Cairo time-zone
      results.forEach((result) => {
        result.date = new Date(result.date).toLocaleString("en-US", {
          timeZone: "Africa/Cairo",
        });
      });

      // Examinations found, return them
      res.status(200).json({
        totalPages,
        currentPage: page,
        data: results,
      });
    });
  });
};

export const updateTransfer = async () => {
  const { transfer_id } = req.params;
  const { student_id, transferReason, notes, exHosp_id } = req.body;
  const checkSql = "SELECT * FROM transfers WHERE transfer_id=?";
  db.query(checkSql, [transfer_id], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(checkErr);
    }
    if (checkResult.length === 0) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "التحويل غير موجود" });
    }
    const updateSql =
      "UPDATE transfers SET student_id=?,transferReason=?,notes=?,exHosp_id=? WHERE transfer_id=?";
    db.query(
      updateSql,
      [student_id, transferReason, notes, exHosp_id, transfer_id],
      (err, result) => {
        if (err) {
          return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
        }

        // Audit log
        const isSuperAdmin = req.user[0].role === roles.SUPER_ADMIN; // Check if the user is a super admin
        const auditData = {
          timestamp: new Date().toISOString(),
          method: "تعديل تحويل طالب",
          body: {
            student_id,
            transferReason,
            notes,
            exHosp_id,
          },
          admin_id: isSuperAdmin
            ? req.user[0].superAdmin_id
            : req.user[0].user_id,
          adminName: isSuperAdmin ? req.user[0].name : req.user[0].userName,
        };
        insertAuditLog(auditData);

        return res
          .status(StatusCode.OK)
          .json({ message: "تم تعديل التحويل بنجاح" });
      },
    );
  });
};
