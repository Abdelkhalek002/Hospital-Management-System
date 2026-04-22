import nodemailer from "nodemailer";
import asyncHandler from "express-async-handler";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  signToken,
  verifyToken,
} from "../modules/auth/services/jwt.service.js";
import dotenv from "dotenv";
import Auth from "../modules/auth/auth.repository.js";
import { UserType } from "../utils/user-types.js";
import { StatusCode } from "../utils/status-codes.js";
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
  constructor(user, url, otp) {
    this.to = user.email;
    const fallbackName = (user.email || "user").split("@")[0];
    this.firstName = (user.username || fallbackName).split(" ")[0];
    this.url = url;
    this.otp = otp;
    this.from = `Helwan University Hospital <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === "production") {
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
  async sendConfirmation() {
    await this.send("confirm", "Email Confirmation");
  }
  async sendOtp() {
    await this.send("otp", "تغيير كلمة السر");
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
  await new Auth().activateEmail(UserType.STUDENT, decoded.email);
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
  // 2. activate email and save data into the database
  await new Auth().confirmEmail(UserType.SUPER_ADMIN, decoded.email);
  // 3. send response
  return res.status(StatusCode.OK).send(html);
});

// SEND OTP TO USER
export const sendOtpMail = async (user, otp) => {
  const url = `http://localhost:7000/api/v1/auth/resetPassword`;
  await new Email(user, url, otp).sendOtp();
};
