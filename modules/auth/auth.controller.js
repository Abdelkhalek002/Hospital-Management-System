// IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import pool from "../../config/db.js";
import * as authService from "./services/auth.service.js";
import { roles } from "../../utils/roles.js";
import { StatusCode } from "../../utils/status-codes.js";
import dotenv from "dotenv";
dotenv.config();

//----------------------------------SIGNUP---------------------------------------
const allowedFields = [
  "username",
  "email",
  "password",
  "national_id",
  "nationality_id",
  "level_id",
  "gov_id",
  "faculty_id",
  "gender",
  "birth_date",
  "phone_number",
  "user_image_file",
  "national_id_file",
  "fees_file",
];
const pick = (obj, fields) =>
  fields.reduce((acc, field) => {
    if (obj[field] !== undefined) acc[field] = obj[field];
    return acc;
  }, {});

export const signup = asyncHandler(async (req, res) => {
  const studentData = pick(req.body, allowedFields);
  await authService.signup(studentData);
  res.status(201).json({
    status: "success",
    message:
      "تم عمل البريد الالكتروني بنجاح برجاء تفقد البريد الالكتروني للتفعيل",
  });
});

//--------------------------------------LOGIN------------------------------------
export const login = asyncHandler(async (req, res) => {
  const { password, username, email } = req.body;

  //1- SuperAdmin login
  if (email && email.includes("@hsh.io")) {
    const sqlSuperAdmin =
      "SELECT email, name, password, superAdmin_id, confirmed FROM superadmin WHERE email = ? AND role ='hsh_2_sa_4'";
    const superAdminResult = await new Promise((resolve, reject) => {
      pool.query(sqlSuperAdmin, [email], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    if (superAdminResult.length === 0) {
      return res.status(StatusCode.NOT_FOUND).json({ message: "غير موجود" });
    }

    const {
      email: superAdminEmail,
      password: hashedPassword,
      superAdmin_id,
      name,
      confirmed,
      role,
    } = superAdminResult[0];

    const passwordMatch = await bcrypt.compare(
      password.trim(),
      hashedPassword.trim(),
    );
    if (!passwordMatch) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json({ success: false, error: "كلمة المرور غير صحيحة" });
    }
    if (!confirmed) {
      authService.sendConfirmationMail(email, name);
      return res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        error:
          "الايميل غير مفعل. تم ارسال رسالة تفعيل الى البريد الالكتروني الخاص بك",
      });
    }

    const payLoad = {
      userId: superAdmin_id,
      email: superAdminEmail,
      name,
      role: `${roles.SUPER_ADMIN}`,
      confirmed: confirmed,
    };
    const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });

    setTimeout(() => {
      pool.query(
        "UPDATE superadmin SET status = 0, confirmed = 0 WHERE superAdmin_id = ?",
        [superAdmin_id],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating status and confirmed:", updateErr);
          } else {
            console.log(
              "Status and confirmed updated to 0 for super admin after 1 hour",
            );
          }
        },
      );
    }, 3600000);

    pool.query(
      "UPDATE superadmin SET status=1 WHERE superAdmin_id = ?",
      [superAdmin_id],
      (updateErr, updateResult) => {
        if (updateErr) {
          return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(updateErr);
        } else {
          console.log("Super Admin Logged in successfully");
          return res
            .status(StatusCode.OK)
            .json({ success: true, token, payLoad });
        }
      },
    );
    return;
  }

  //2- admin login
  if (email && email.includes("@admin.com")) {
    const sqlAdmin =
      "SELECT email, username, password, user_id, type, role FROM admins WHERE email = ?";
    pool.query(sqlAdmin, [email], async (err, result) => {
      if (err) {
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
      }

      if (result.length === 0) {
        return res
          .status(StatusCode.NOT_FOUND)
          .json({ message: "الادمن غير موجود" });
      }

      const {
        email: adminEmail,
        password: hashedPassword,
        user_id,
        username,
        type,
        role,
      } = result[0];

      const passwordMatch = await bcrypt.compare(
        password.trim(),
        hashedPassword.trim(),
      );
      if (!passwordMatch) {
        return res
          .status(StatusCode.UNAUTHORIZED)
          .json({ success: false, error: "كلمة المرور غير صحيحة" });
      }

      const payLoad = {
        userId: user_id,
        email: adminEmail,
        name: username,
        type,
        role,
      };

      const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME,
      });

      pool.query(
        "UPDATE admins SET status = 1 WHERE user_id = ?",
        [user_id],
        (updateErr, updateResult) => {
          if (updateErr) {
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(updateErr);
          }
          return res
            .status(StatusCode.OK)
            .json({ success: true, token, payLoad });
        },
      );
    });
    return;
  }

  //3- User login
  if (email && email.includes("helwan.edu.eg")) {
    const sqlUser =
      "SELECT username, email, password, type, student_id, verified FROM students WHERE email = ?";
    pool.query(sqlUser, [email], async (err, result) => {
      if (err) {
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
      }
      if (result.length === 0) {
        return res
          .status(StatusCode.NOT_FOUND)
          .json({ message: "المستخدم غير موجود" });
      }

      const {
        email: userEmail,
        password: hashedPassword,
        student_id,
        verified,
        username,
        type,
      } = result[0];

      const passwordMatch = await bcrypt.compare(
        password.trim(),
        hashedPassword.trim(),
      );
      if (!passwordMatch) {
        return res
          .status(StatusCode.UNAUTHORIZED)
          .json({ success: false, error: "كلمة المرور غير صحيحة" });
      }

      if (!verified) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          error: "الاكونت غير مفعل رجاء تفقد البريد الالكتروني لتفعيل الاكونت",
        });
      }

      if (blocked) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          error: "الاكونت محظور تواصل مع الادمن",
        });
      }

      const currentDate = new Date();
      const nextYear = new Date(currentDate.getFullYear() + 1, 0, 1); // January 1st of next year
      const expiresInMilliseconds = nextYear - currentDate;
      const expiresInDays = Math.ceil(
        expiresInMilliseconds / (24 * 60 * 60 * 1000),
      );

      const payLoad = {
        userId: student_id,
        email: userEmail,
        name: username,
        type,
      };

      const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
        expiresIn: expiresInDays + "d",
      });

      // Update status to 1
      pool.query(
        "UPDATE students SET status = 1 WHERE student_id = ?",
        [student_id],
        (updateErr, updateResult) => {
          if (updateErr) {
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(updateErr);
          }
          return res
            .status(StatusCode.OK)
            .json({ success: true, token, payLoad });
        },
      );
    });
    return;
  }

  return res
    .status(StatusCode.BAD_REQUEST)
    .json({ success: false, error: "برجاء كتابة الايميل وكلمة المرور" });
});

//--------------------------------------forget Password--------------------------
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email, OTP, newPassword } = req.body;

  const sql = "SELECT * FROM students WHERE email = ? AND OTP = ?";
  pool.query(sql, [email, OTP], async (err, result) => {
    if (err) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    } else {
      if (result.length === 0) {
        return res
          .status(StatusCode.NOT_FOUND)
          .json({ message: "Invalid OTP" });
      } else {
        const { email } = result[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        pool.query(
          "UPDATE students SET password = ?, OTP = NULL WHERE email = ?",
          [hashedPassword, email],
          (err, result) => {
            if (err) {
              return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
            } else {
              return res
                .status(StatusCode.OK)
                .json({ message: "تم تغيير كلمة السر بنجاح" });
            }
          },
        );
      }
    }
  });
});
