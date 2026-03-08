// IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import db from "../../config/db.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import sanitizeFilename from "sanitize-filename";

import { sendActivationMail } from "./auth.service.js";
import { sendConfirmationMail } from "./auth.service.js";
import {
  isEmailExist,
  isNationalIdExist,
  isIDExist,
} from "./auth.validator.js";
import { roles } from "../../utils/roles.js";
import { StatusCode } from "../../utils/statusCode.js";
import dotenv from "dotenv";
dotenv.config({ path: "config.env" });

//upload image middleware
const multerStorage = multer.memoryStorage();
const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
const multerFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG images are allowed"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Middleware to handle image and national ID upload
export const uploadRegisterationFiles = upload.fields([
  { name: "userImage_file", maxCount: 1 },
  { name: "national_id_file", maxCount: 1 },
  { name: "fees_file", maxCount: 1 },
]);

// Middleware to resize uploaded image and save national ID
export const resizeFiles = async (req, res, next) => {
  try {
    // Resize and save profile image
    if (req.files["userImage_file"] && req.files["userImage_file"][0]) {
      const userImage_file = req.files["userImage_file"][0];
      const userImage_name = `Document-${uuidv4()}-${Date.now()}.jpeg`;
      const sanitizeduserImage_Filename = sanitizeFilename(userImage_name);
      const userImage_Directory = "uploads";

      if (!fs.existsSync(userImage_Directory)) {
        fs.mkdirSync(userImage_Directory, { recursive: true });
      }

      await sharp(userImage_file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toFile(path.join(userImage_Directory, sanitizeduserImage_Filename));

      req.body.userImage_file = sanitizeduserImage_Filename;
    }
    // Save national ID
    if (req.files["national_id_file"] && req.files["national_id_file"][0]) {
      const national_id_file = req.files["national_id_file"][0];
      const national_id_name = `Document-${uuidv4()}-${Date.now()}.jpeg`;
      const sanitizedNationalId_Filename = sanitizeFilename(national_id_name);
      const national_id_Directory = "uploads/student_info/national_id";

      if (!fs.existsSync(national_id_Directory)) {
        fs.mkdirSync(national_id_Directory, { recursive: true });
      }

      fs.writeFileSync(
        path.join(national_id_Directory, sanitizedNationalId_Filename),
        national_id_file.buffer,
      );

      req.body.national_id_file = sanitizedNationalId_Filename;
    }
    // Save fees
    if (req.files["fees_file"] && req.files["fees_file"][0]) {
      const fees_file = req.files["fees_file"][0];
      const fessFile_name = `Document-${uuidv4()}-${Date.now()}.jpeg`;
      const sanitizedFees_Filename = sanitizeFilename(fessFile_name);
      const fees_Directory = "uploads/student_info/fees";

      if (!fs.existsSync(fees_Directory)) {
        fs.mkdirSync(fees_Directory, { recursive: true });
      }

      fs.writeFileSync(
        path.join(fees_Directory, sanitizedFees_Filename),
        fees_file.buffer,
      );

      req.body.fees_file = sanitizedFees_Filename;
    }

    next();
  } catch (error) {
    return next(error);
  }
};

//----------------------------------SIGNUP---------------------------------------
export const signup = asyncHandler(async (req, res) => {
  const {
    userName,
    email,
    password,
    national_id,
    nationality_id,
    level_id,
    gov_id,
    faculty_id,
    gender,
    birthDay,
    phoneNumber,
    userImage_file,
    national_id_file,
    fees_file,
  } = req.body;
  //1- Check if email already exists in the database:
  db.query("SELECT * FROM students WHERE email = ?", [email], (err, result) => {
    if (isEmailExist(err, result)) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "الايميل موجود بالفعل" });
    } else {
      //2- check if national id exists:
      db.query(
        "SELECT * FROM students WHERE national_id = ?",
        [national_id],
        (err, result) => {
          if (isNationalIdExist(err, result)) {
            return res
              .status(StatusCode.BAD_REQUEST)
              .json({ error: "الرقم القومي موجود بالفعل" });
          } else {
            //3- check if data ids entered correctly:
            //* faculty id:
            db.query(
              "SELECT * FROM faculties WHERE faculty_id = ?",
              [faculty_id],
              (err, result) => {
                if (isIDExist(err, result, faculty_id)) {
                  return res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ error: "faculty entered is not in system" });
                } else {
                  //* level id:
                  db.query(
                    "SELECT * FROM levels WHERE level_id = ?",
                    [level_id],
                    (err, result) => {
                      if (isIDExist(err, result, level_id)) {
                        return res
                          .status(StatusCode.BAD_REQUEST)
                          .json({ error: "level entered is not in system" });
                      } else {
                        //* nationality id:
                        db.query(
                          "SELECT * FROM nationality WHERE nationality_id = ?",
                          [nationality_id],
                          (err, result) => {
                            if (isIDExist(err, result, nationality_id)) {
                              return res.status(StatusCode.BAD_REQUEST).json({
                                error: "nationality entered is not in system",
                              });
                            } else {
                              //* gov id:
                              db.query(
                                "SELECT * FROM governorates WHERE gov_id = ?",
                                [gov_id],
                                (err, result) => {
                                  if (isIDExist(err, result, nationality_id)) {
                                    return res
                                      .status(StatusCode.BAD_REQUEST)
                                      .json({
                                        error:
                                          "governorate entered is not in system",
                                      });
                                  }
                                  //4- insert data into database:
                                  //*hashing password:
                                  const hashedPassword = bcrypt.hashSync(
                                    password,
                                    10,
                                  );
                                  db.query(
                                    "INSERT INTO students (userName, email, password, national_id, nationality_id, level_id, gov_id, faculty_id, gender, birthDay, phoneNumber, userImage_file, national_id_file, fees_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                    [
                                      userName,
                                      email,
                                      hashedPassword,
                                      national_id,
                                      nationality_id,
                                      level_id,
                                      gov_id,
                                      faculty_id,
                                      gender,
                                      birthDay,
                                      phoneNumber,
                                      userImage_file,
                                      national_id_file,
                                      fees_file,
                                    ],
                                  );
                                  //*sending activation mail...
                                  //sendActivationMail(email, userName);
                                  res.status(StatusCode.CREATED).json({
                                    success: true,
                                    message:
                                      "تم عمل البريد الالكتروني بنجاح برجاء تفقد البريد الالكتروني للتفعيل ",
                                  });
                                },
                              );
                            }
                          },
                        );
                      }
                    },
                  );
                }
              },
            );
          }
        },
      );
    }
  });
});

//--------------------------------------LOGIN------------------------------------
export const login = asyncHandler(async (req, res) => {
  const { password, userName, email } = req.body;

  //1- SuperAdmin login
  if (email && email.includes("@hsh.io")) {
    const sqlSuperAdmin =
      "SELECT email, name, password, superAdmin_id, confirmed FROM superadmin WHERE email = ? AND role ='hsh_2_sa_4'";
    const superAdminResult = await new Promise((resolve, reject) => {
      db.query(sqlSuperAdmin, [email], (err, result) => {
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
      sendConfirmationMail(email, name);
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
      db.query(
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

    db.query(
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
      "SELECT email, userName, password, user_id, type, role FROM admins WHERE email = ?";
    db.query(sqlAdmin, [email], async (err, result) => {
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
        userName,
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
        name: userName,
        type,
        role,
      };

      const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME,
      });

      db.query(
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
      "SELECT userName, email, password, type, student_id, verified FROM students WHERE email = ?";
    db.query(sqlUser, [email], async (err, result) => {
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
        userName,
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
        name: userName,
        type,
      };

      const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
        expiresIn: expiresInDays + "d",
      });

      // Update status to 1
      db.query(
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

//--------------------------------------forget Password------------------------------------
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email, OTP, newPassword } = req.body;

  const sql = "SELECT * FROM students WHERE email = ? AND OTP = ?";
  db.query(sql, [email, OTP], async (err, result) => {
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

        db.query(
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
