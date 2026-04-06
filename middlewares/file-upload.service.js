import path from "path";
import { promises as fs } from "fs";
import { createHash, randomBytes } from "crypto";
import multer from "multer";
import sanitizeFilename from "sanitize-filename";
import asyncHandler from "express-async-handler";

import ApiError from "../utils/api-error.js";
import { StatusCode } from "../utils/status-codes.js";

const multerStorage = multer.memoryStorage();
const STUDENTS_PARENT_DIRECTORY = path.join("uploads", "students");

const registrationUploadFieldNames = [
  "user_image_file",
  "national_id_file",
  "fees_file",
];
const fileFieldAliases = {
  user_image_file: "profile",
  national_id_file: "national-id",
  fees_file: "fees",
};
const FILE_NAME_MAX_ATTEMPTS = 10;

const multerFilter = (req, file, cb) => {
  if (file.mimetype.endsWith("/jpeg")) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        "Only JPG and JPEG files are allowed!",
        StatusCode.BAD_REQUEST,
      ),
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Upload files
export const uploadRegistrationFiles = upload.fields([
  { name: "user_image_file", maxCount: 1 },
  { name: "national_id_file", maxCount: 1 },
  { name: "fees_file", maxCount: 1 },
]);

// get uploaded files
const getUploadedFile = (req, fieldName) => req.files?.[fieldName]?.[0];

const ensureDirectory = async (directory) => {
  await fs.mkdir(directory, { recursive: true });
};

const ensureSafeUsername = (username) => {
  if (typeof username !== "string" || username.length === 0) {
    throw new ApiError(
      "Username is required for student uploads",
      StatusCode.BAD_REQUEST,
    );
  }

  const hasPathSeparators = username.includes("/") || username.includes("\\");
  const isParentTraversal = username.includes("..");
  const safeUsername = sanitizeFilename(username);

  if (
    hasPathSeparators ||
    isParentTraversal ||
    safeUsername.length === 0 ||
    safeUsername !== username
  ) {
    throw new ApiError(
      "Invalid username for upload directory",
      StatusCode.BAD_REQUEST,
    );
  }

  return username;
};

const getStudentDirectory = (username) => {
  const rootDirectory = path.resolve(STUDENTS_PARENT_DIRECTORY);
  const studentDirectory = path.resolve(
    path.join(STUDENTS_PARENT_DIRECTORY, username),
  );

  const isInsideStudentsRoot =
    studentDirectory === rootDirectory ||
    studentDirectory.startsWith(`${rootDirectory}${path.sep}`);

  if (!isInsideStudentsRoot) {
    throw new ApiError("Invalid upload path", StatusCode.BAD_REQUEST);
  }

  return studentDirectory;
};

const hasJpegMagicBytes = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
    return false;
  }

  const startsWithJpegSignature = buffer[0] === 0xff && buffer[1] === 0xd8;
  const endsWithJpegSignature =
    buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;

  return startsWithJpegSignature && endsWithJpegSignature;
};

const ensureValidJpegContent = (file, fieldName) => {
  if (!hasJpegMagicBytes(file?.buffer)) {
    throw new ApiError(
      `Invalid file content for "${fieldName}". Only real JPEG images are allowed.`,
      StatusCode.BAD_REQUEST,
    );
  }
};

const createImmutableStudentKey = (requestBody) => {
  const nationalId = String(requestBody?.national_id ?? "").trim();
  if (!nationalId) {
    throw new ApiError("National ID is required", StatusCode.BAD_REQUEST);
  }

  return createHash("sha256").update(nationalId).digest("hex").slice(0, 12);
};

const formatTimestampForFileName = () =>
  new Date().toISOString().replace(/[-:.TZ]/g, "");

const buildAuditFriendlyFileName = (fieldName, studentKey) => {
  const alias = fileFieldAliases[fieldName] || "document";
  const timestamp = formatTimestampForFileName();
  const randomSuffix = randomBytes(4).toString("hex");

  return `${alias}-${studentKey}-${timestamp}-${randomSuffix}.jpeg`;
};

const getSafeOutputPath = (studentDirectory, fileName) => {
  const outputPath = path.resolve(path.join(studentDirectory, fileName));
  const isInsideStudentDirectory =
    outputPath === studentDirectory ||
    outputPath.startsWith(`${studentDirectory}${path.sep}`);

  if (!isInsideStudentDirectory) {
    throw new ApiError("Invalid output path", StatusCode.BAD_REQUEST);
  }

  return outputPath;
};

const writeStudentFileCollisionSafe = async ({
  studentDirectory,
  fieldName,
  studentKey,
  fileBuffer,
}) => {
  for (let attempt = 0; attempt < FILE_NAME_MAX_ATTEMPTS; attempt += 1) {
    const fileName = buildAuditFriendlyFileName(fieldName, studentKey);
    const outputPath = getSafeOutputPath(studentDirectory, fileName);

    try {
      await fs.writeFile(outputPath, fileBuffer, { flag: "wx" });
      return fileName;
    } catch (error) {
      if (error?.code === "EEXIST") {
        continue;
      }
      throw error;
    }
  }

  throw new ApiError(
    `Could not create a unique file name for "${fieldName}"`,
    StatusCode.INTERNAL_SERVER_ERROR,
  );
};

export const resizeFiles = asyncHandler(async (req, _res, next) => {
  const username = ensureSafeUsername(req.body?.username);
  const studentDirectory = getStudentDirectory(username);
  let studentKey = null;

  await ensureDirectory(studentDirectory);

  for (const fieldName of registrationUploadFieldNames) {
    const file = getUploadedFile(req, fieldName);
    if (!file) {
      continue;
    }

    ensureValidJpegContent(file, fieldName);
    if (!studentKey) {
      studentKey = createImmutableStudentKey(req.body);
      req.body.student_upload_key = studentKey;
    }

    const fileName = await writeStudentFileCollisionSafe({
      studentDirectory,
      fieldName,
      studentKey,
      fileBuffer: file.buffer,
    });

    req.body[fieldName] = path.posix.join("students", username, fileName);
  }

  next();
});
