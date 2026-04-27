import asyncHandler from "express-async-handler";
import { StatusCode } from "../../utils/status-codes.js";
import Base from "../../repositories/base.repository.js";
import * as service from "./admin.service.js";
import { auditLog } from "../../utils/audit-log.js";
import { pick } from "../../utils/pick-from-body-request.js";

export const createOne = asyncHandler(async (req, res) => {
  // 1. pick valid data only from req.body
  const allowedFields = ["username", "email", "password", "role"];
  const data = pick(req.body, allowedFields);

  // 2. create admin
  const result = await service.createOne(data);

  // 3. record action
  const auditData = {
    adminId: req.user.id,
    method: "اضافة ادمن جديد",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);
  // 4. send response
  return res.status(StatusCode.CREATED).json({
    status: "success",
    message: `تم إضافة أدمن جديد`,
  });
});

export const updateOne = asyncHandler(async (req, res) => {
  // 1. pick valid data only from req.body
  const allowedFields = ["username", "email", "role"];
  const data = pick(req.body, allowedFields);
  const { id } = req.params;

  // 2. update admin
  await service.updateOne(id, data);

  // 3. record action
  const auditData = {
    adminId: req.user.id,
    method: "تعديل بيانات أدمن",
    createdAt: new Date().toISOString(),
  };

  // 4. send response
  return res.status(StatusCode.CREATED).json({
    status: "success",
    message: `تم تعديل بيانات الأدمن بنجاح`,
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await service.getOne(id);

  return res.status(StatusCode.OK).json({
    status: "success",
    data: result,
  });
});

export const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll();

  return res.status(StatusCode.OK).json({
    status: "success",
    results: result.length,
    data: result,
  });
});

export const deleteOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedAdmin = await service.deleteOne(id);

  await auditLog({
    adminId: req.user.id,
    method: "حذف ادمن",
    createdAt: new Date().toISOString(),
  });

  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تم حذف الادمن بنجاح",
    data: deletedAdmin,
  });
});

//--------------------------------LOGS-------------------------------------
export const getLogs = asyncHandler(async (req, res) => {
  // Parse query parameters for pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  // Query to fetch total count of admin logs
  const countSql = "SELECT COUNT(*) AS count FROM admin_log";

  // Query to fetch paginated admin logs
  const sql =
    "SELECT * FROM admin_log ORDER BY adminLog_id DESC LIMIT ? OFFSET ?";

  // Get the total count of admin logs
  db.query(countSql, (err, countResults) => {
    if (err) {
      console.error("Error fetching count of admin logs:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const totalCount = countResults[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    db.query(sql, [limit, offset], (error, results) => {
      if (error) {
        console.error("Error fetching admin logs:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json({
        totalPages,
        currentPage: page,
        adminLogs: results,
      });
    });
  });
});

export const getLog = asyncHandler(async (req, res) => {
  const { admin_id } = req.params;
  const sql = "SELECT * FROM admin_log WHERE admin_id = ?";
  db.query(sql, [admin_id], (err, result) => {
    if (err) {
      return res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: "فشل في استرجاع العمليات المسجلة" });
    }
    res.status(StatusCode.OK).json(result);
  });
});

export const deleteLogs = asyncHandler(async (req, res) => {
  const sql = "DELETE FROM admin_log";
  db.query(sql, (err, result) => {
    if (err) {
      return res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: "فشل في حذف العمليات المسجلة" });
    }
    res.status(StatusCode.OK).json({ message: "تم حذف العمليات المسجلة" });
  });
});

export const deleteLog = asyncHandler(async (req, res) => {
  const { admin_id } = req.params;

  const isExist = `SELECT * FROM admin_log WHERE admin_id = ?`;
  db.query(isExist, [admin_id], (err, result) => {
    if (err) {
      return res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: "Database query error" });
    }
    // Check if result is undefined or empty
    if (!result || result.length === 0) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "العمليات الخاصة بهذا المستخدم غير موجودة" });
    }

    // If logs exist, proceed with deletion
    const sql = "DELETE FROM admin_log WHERE admin_id=?";
    db.query(sql, [admin_id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        return res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: "Failed to clear admin logs" });
      }
      return res
        .status(StatusCode.OK)
        .json({ message: "تم حذف العمليات المسجلة" });
    });
  });
});

//------------------------------STATS-----------------------------------------
export const getStats = asyncHandler(async (req, res) => {
  const result = await new Base().getStats();
  res.status(StatusCode.OK).json({
    msg: "success",
    data: result,
  });
});
