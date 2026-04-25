import bcrypt from "bcrypt";
import Base from "../../repositories/base.repository.js";
import SuperAdmin from "./super-admin.repository.js";
import Admin from "../admin/admin.repository.js";
import * as emailService from "../../services/email.service.js";
import ApiError from "../../utils/api-error.js";

export const addOne = async (data) => {
  // 1. check if username or email provided is already existed
  const usernameExists = await new Base("super_admins").existsByField(
    "username",
    data.username,
  );
  if (usernameExists) throw new ApiError("username already exists");
  const emailExists = await new Base("super_admins").existsByField(
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
  const newAdmin = await new SuperAdmin().create(finalData);

  //5. send confirmation email
  //await emailService.sendConfirmationMail(newAdmin);
  return newAdmin;
};

export const addNewAdmin = async (data) => {
  // 1. check if username or email provided is already existed
  const usernameExists = await new Base("admins").existsByField(
    "username",
    data.username,
  );
  if (usernameExists) throw new ApiError("username already exists");
  const emailExists = await new Base("admins").existsByField(
    "email",
    data.email,
  );
  if (emailExists) throw new ApiError("email already exists");

  // 2. hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // 3. build final payload
  const finalData = {
    ...data,
    password: hashedPassword,
  };

  // 4. create admin
  const newAdmin = await new Admin().create(finalData);

  // 5. return result
  return newAdmin;
};
