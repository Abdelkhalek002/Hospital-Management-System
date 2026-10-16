// Importing dependencies
import UserRepository from "../modules/user/user.repository.js";

// To check if the code is in Arabic or not
export const isArabic = (value) => {
  return /^[؀-ۿـ\s]+$/u.test(value);
};

// To validate appointment date
export const isValidDate = (value) => {
  const timestamp = new Date(value).getTime();
  return !Number.isNaN(timestamp) || timestamp <= Date.now();
};

// To check if the account is verified
export const isVerified = async (email) => {
  return await new UserRepository().isVerified(email);
};

export const matchesDomain = (email, configuredDomain) => {
  if (!email || !configuredDomain) return false;
  const target = configuredDomain.replace(/^@/, "").toLowerCase().trim();
  if (!target) return false;
  const emailDomain = (email.split("@")[1] || "").toLowerCase().trim();
  return emailDomain === target || emailDomain.endsWith("." + target);
};

// Allow any valid email for regular user registration
export const isAllowedEmail = () => true;

export const isAdminAllowedEmail = (value) => {
  return (
    matchesDomain(value, process.env.SUPER_ADMIN_EMAIL_DOMAIN) ||
    matchesDomain(value, process.env.ADMIN_EMAIL_DOMAIN)
  );
};

export const isAllowedEmailForLogin = () => true;

export const otpExist = (_, { req }) => {
  return req.body.OTP || req.body.otp;
};
