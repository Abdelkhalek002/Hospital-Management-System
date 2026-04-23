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
  try {
    const result = await new MedicalExamination().index({
      page,
      limit,
      searchKey,
    });
    return result;
  } catch (error) {
    console.error("Transfer service error:", error);
    throw new ApiError(
      "Failed to fetch transferred data",
      StatusCode.BAD_REQUEST,
    );
  }
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
