// IMPORTING DEPENDENCIES
import { body } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import { roles } from "../../utils/roles.js";

const validAdminRoles = [
  roles.SUPER_ADMIN,
  roles.SECOND_MANAGER,
  roles.OBSERVER,
  roles.MEDICAL_CHECK_MANAGER,
  roles.COUNTER,
];

const roleMap = {
  [roles.SUPER_ADMIN]: roles.SUPER_ADMIN,
  [roles.SECOND_MANAGER]: roles.SECOND_MANAGER,
  [roles.OBSERVER]: roles.OBSERVER,
  [roles.MEDICAL_CHECK_MANAGER]: roles.MEDICAL_CHECK_MANAGER,
  [roles.COUNTER]: roles.COUNTER,
  super_admin: roles.SUPER_ADMIN,
  second_manager: roles.SECOND_MANAGER,
  observer: roles.OBSERVER,
  viewer: roles.OBSERVER,
  medical_check_manager: roles.MEDICAL_CHECK_MANAGER,
  counter: roles.COUNTER,
};

export const addNewAdminValidator = [
  body("username")
    .customSanitizer(
      (val, { req }) => val || req.body?.userName || req.body?.name,
    )
    .notEmpty()
    .withMessage("username is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is not valid"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
  body("role")
    .notEmpty()
    .withMessage("role is required")
    .customSanitizer((val) => {
      if (typeof val === "string") {
        const key = val.trim().toLowerCase();
        return roleMap[val] || roleMap[key] || val;
      }
      return val;
    })
    .isIn(validAdminRoles)
    .withMessage("Invalid admin role"),
  body("profile_photo").optional(),
  handleValidationErrors,
];

export const updateAdminValidator = [
  body("username")
    .optional()
    .customSanitizer(
      (val, { req }) => val || req.body?.userName || req.body?.name,
    )
    .notEmpty()
    .withMessage("username cannot be empty"),
  body("email")
    .optional()
    .notEmpty()
    .withMessage("email cannot be empty")
    .isEmail()
    .withMessage("email is not valid"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
  body("role")
    .optional()
    .notEmpty()
    .withMessage("role cannot be empty")
    .customSanitizer((val) => {
      if (typeof val === "string") {
        const key = val.trim().toLowerCase();
        return roleMap[val] || roleMap[key] || val;
      }
      return val;
    })
    .isIn(validAdminRoles)
    .withMessage("Invalid admin role"),
  body("profile_photo").optional(),
  handleValidationErrors,
];
