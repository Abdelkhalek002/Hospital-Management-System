import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { renderHTML } from "../renderHTML.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.username.split(" ")[0];
    this.url = url;
    this.from = `Abdelkhalek Mahmoud <${process.env.EMAIL_FROM}>`;
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
    // 1) Render HTML template
    const html = await renderHTML(`${__dirname}/views/${template}.html`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
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
    await this.send("activate", "أهلاً بيك في مستشفى جامعة حلوان");
  }
  async sendConfirmation() {
    await this.send("confirm", "أهلاً بيك في مستشفى جامعة حلوان");
  }
  // async sendPasswordReset() {
  //   await this.send(
  //     "passwordReset",
  //     "Your token for resetting password (valid for 10 minutes)",
  //   );
  // }
}
