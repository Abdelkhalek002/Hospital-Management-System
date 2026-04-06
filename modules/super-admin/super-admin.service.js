import bcrypt from "bcrypt";
import BaseRepo from "../../repositories/base.repository.js";
import SuperAdminRepo from "./super-admin.repository.js";
import * as emailService from "../../services/email.service.js";
import ApiError from "../../utils/api-error.js";

export const addOne = async (data) => {
  // 1. check if username or email provided is already existed
  const usernameExists = await new BaseRepo().existsByField(
    "super_admins",
    "username",
    data.username,
  );
  if (usernameExists) throw new ApiError("username already exists");
  const emailExists = await new BaseRepo().existsByField(
    "super_admins",
    "email",
    data.email,
  );
  if (emailExists) throw new ApiError("email already exists");

  // 2. hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  //3. build final payload
  const finalData = {
    ...data,
    password: hashedPassword,
  };

  //4. create super admin
  const newAdmin = await new SuperAdminRepo().create(finalData);

  //5. send confirmation email
  //await emailService.sendConfirmationMail(newAdmin);
  return newAdmin;
};
