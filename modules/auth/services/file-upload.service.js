import path from "path";
import fs from "fs";
import multer from "multer";
import sanitizeFilename from "sanitize-filename";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

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
