import asyncHandler from "express-async-handler";
import { StatusCode } from "../../utils/status-codes.js";
import Base from "../../repositories/base.repository.js";
import * as service from "./admin.service.js";
import { auditLog } from "../../utils/audit-log.js";
import { pick } from "../../utils/pick-from-body-request.js";
import jwt from "jsonwebtoken";

export const createOne = asyncHandler(async (req, res) => {
  // 1. pick valid data only from req.body
  const allowedFields = ["username", "email", "password", "role"];
  const pick = (obj, fields) =>
    fields.reduce((acc, field) => {
      if (obj[field] !== undefined) acc[field] = obj[field];
      return acc;
    }, {});
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
  const user_id = req.params.user_id;
  const { userName, email, role } = req.body;

  // Check if the admin exists
  const checkSql = "SELECT * FROM admins WHERE user_id = ?";
  db.query(checkSql, [user_id], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(checkErr);
    }
    if (checkResult.length === 0) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "الادمن غير موجود" });
    }

    // Update admin details
    const updateSql =
      "UPDATE admins SET userName = ?, email = ?, role = ? WHERE user_id = ?";
    db.query(updateSql, [userName, email, role, user_id], (err, result) => {
      if (err) {
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
      } else {
        // Create audit record
        const auditData = {
          timestamp: new Date().toISOString(),
          method: "تعديل الادمن",
          body: { user_id, userName, email, role },
          adminName: req.user[0].name,
          admin_id: req.user[0].superAdmin_id,
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
              return res.status(StatusCode.SERVICE_UNAVAILABLE).send(auditErr);
            }
            console.log("Audit record created successfully:", auditResult);
            res
              .status(StatusCode.OK)
              .json({ message: "تم تعديل بيانات الادمن بنجاج", auditData });
          },
        );
      }
    });
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const sql = "SELECT * FROM admins WHERE user_id = ?";

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    } else {
      console.log(result);
      if (result.length === 0) {
        res.status(StatusCode.NOT_FOUND).json({ message: "الادمن غير موجود" });
      } else {
        res.status(StatusCode.OK).json(result);
      }
    }
  });
});

export const getAll = asyncHandler(async (req, res) => {
  const sql = "SELECT * FROM admins";
  db.query(sql, (err, result) => {
    if (err) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    } else {
      console.log("request created successfully");
      res.status(StatusCode.OK).json(result);
    }
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

export const deleteOne = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  const selectSql =
    "SELECT userName, email, role FROM admins WHERE user_id = ?";
  db.query(selectSql, [user_id], (selectErr, selectResult) => {
    if (selectErr) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(selectErr);
    }
    if (selectResult.length === 0) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "الادمن غير موجود" });
    }
    const { userName, email, role } = selectResult[0];
    const deleteSql = "DELETE FROM admins WHERE user_id = ?";
    db.query(deleteSql, [user_id], (deleteErr) => {
      if (deleteErr) {
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(deleteErr);
      }
      const auditData = {
        timestamp: new Date().toISOString(),
        method: "حذف ادمن",
        body: { userName, email, role },
        adminName: req.user[0].name,
        admin_id: req.user[0].superAdmin_id,
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
          } else {
            console.log("Audit record created successfully:", auditResult);
          }
        },
      );
      res
        .status(StatusCode.OK)
        .json({ message: "تم حذف الادمن بنجاح", auditData });
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

export const deleteAllLogs = asyncHandler(async (req, res) => {
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
