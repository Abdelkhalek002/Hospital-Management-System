import asyncHandler from "express-async-handler";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only images are allowed", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// upload new profile photo
export const uploadUserImage = upload.single("user_image_file");
export const resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `profile-${uuidv4()}-${Date.now()}.jpeg`;

  const directory = "uploads";
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(path.join(directory, filename));

  req.body.user_image_file = filename;
  next();
});
