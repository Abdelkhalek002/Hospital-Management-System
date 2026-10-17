import nodemailer from "nodemailer";
import asyncHandler from "express-async-handler";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { signToken, verifyToken } from "../modules/auth/jwt.service.js";
import dotenv from "dotenv";
import { UserType } from "../utils/user-types.js";
import { StatusCode } from "../utils/status-codes.js";
import User from "../modules/user/user.repository.js";
dotenv.config();

const renderHTML = async (path, data) => {
  let content = await fs.readFile(path, "utf-8");
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, "g");
    content = content.replace(regex, data[key]);
  }
  return content;
};
export class Email {
  constructor(user, url, otp, extraData = {}) {
    this.to = user.email;
    const fallbackName = (user.email || "user").split("@")[0];
    this.firstName = (user.username || fallbackName).split(" ")[0];
    this.url = url || process.env.CLIENT_URL || "http://localhost:3000";
    this.otp = otp;
    this.reason = extraData.reason || "";
    this.from = `Helwan University Hospital <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (
      process.env.NODE_ENV === "testing" ||
      process.env.DISABLE_EMAIL === "true" ||
      process.env.EMAIL_SERVICE === "mock"
    ) {
      return nodemailer.createTransport({
        jsonTransport: true,
      });
    }

    if (
      process.env.EMAIL_SERVICE === "gmail" ||
      process.env.EMAIL_HOST?.includes("gmail")
    ) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    if (process.env.NODE_ENV === "production" && process.env.SENDGRID_USERNAME) {
      // sendGrid
      return nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  // send the actual email
  async send(template, subject) {
    // 1. Render HTML template
    const html = await renderHTML(
      `${__dirname}/../services/html/${template}.html`,
      {
        firstName: this.firstName,
        url: this.url,
        otp: this.otp,
        reason: this.reason,
        subject,
      },
    );

    // 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendActivation() {
    await this.send("activate", "تفعيل حساب مستشفي جامعة حلوان");
  }
  async sendActivationOtp() {
    await this.send("activation-otp", "تفعيل الحساب - رمز التحقق لمستشفى جامعة حلوان");
  }
  async sendConfirmation() {
    await this.send("confirm", "Email Confirmation");
  }
  async sendOtp() {
    await this.send("otp", "تغيير كلمة السر");
  }
  async sendDocumentApproved() {
    await this.send("document-approved", "تمت مراجعة مستنداتك وتفعيل حسابك - مستشفى جامعة حلوان");
  }
  async sendDocumentRejected() {
    await this.send("document-rejected", "تنبيه بخصوص مستندات حسابك - مستشفى جامعة حلوان");
  }
}

// ACTIVATE USER ACCOUNT
export const sendActivationMail = async (user) => {
  // 1. sign activation token
  const token = signToken(user, process.env.JWT_SHORT_EXPIRE_TIME);
  const url = `http://localhost:7000/api/v1/auth/activate/?token=${token}`;
  // 2. send token to user
  await new Email(user, url).sendActivation();
  return;
};
export const activateEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const html = await renderHTML(`${__dirname}/../services/html/activated.html`);
  // 1. verify token
  const decoded = await verifyToken(token, process.env.JWT_SECRET);
  // 2. activate email and save data into the database
  const user = await new User(UserType.USER);
  user.activateEmail(decoded.email);
  // 3. send response
  return res.status(StatusCode.OK).send(html);
});

// VALIDATE SUPER ADMIN
export const sendConfirmationMail = async (user) => {
  // 1. sign confirmation token
  const token = signToken(user, process.env.JWT_SHORT_EXPIRE_TIME);
  const url = `http://localhost:7000/api/v1/auth/confirmEmail?token=${token}`;
  // 2. confirm email and save data into the database
  await new Email(user, url).sendConfirmation();
  return;
};

export const confirmEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const html = await renderHTML(`${__dirname}/../services/html/confirmed.html`);
  // 1. verify token
  const decoded = await verifyToken(token, process.env.JWT_SECRET);
  console.log(decoded);
  return;
  // 2. activate email and save data into the database

  // some code ...

  // 3. send response
  return res.status(StatusCode.OK).send(html);
});

// SEND OTP TO USER
export const sendOtpMail = async (user, otp) => {
  const url = `http://localhost:7000/api/v1/auth/resetPassword`;
  await new Email(user, url, otp).sendOtp();
};

// SEND ACTIVATION OTP TO USER
export const sendActivationOtpMail = async (user, otp) => {
  await new Email(user, null, otp).sendActivationOtp();
};

// SEND DOCUMENT APPROVAL MAIL
export const sendDocumentApprovalMail = async (user) => {
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/login`;
  await new Email(user, loginUrl).sendDocumentApproved();
};

// SEND DOCUMENT REJECTION MAIL
export const sendDocumentRejectionMail = async (user, reason) => {
  const profileUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/profile`;
  await new Email(user, profileUrl, null, { reason }).sendDocumentRejected();
};


