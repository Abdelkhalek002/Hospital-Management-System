import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import dotenv from "dotenv";

dotenv.config();

// Ensure test email mode does not perform actual email delivery
process.env.DISABLE_EMAIL = "true";

import pool from "../config/db.js";

const DEFAULT_PORT = Number(process.env.PORT) || 7000;
let serverInstance = null;
let baseUrl = `http://localhost:${DEFAULT_PORT}`;

// Track created test users for cleanup
const testUsersToCleanup = new Set();
const testDirsToCleanup = new Set();

const generateTestCredentials = (prefix = "test") => {
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
  const username = `${prefix}_${randomSuffix.slice(0, 5)}`;
  const email = `${username}_${randomSuffix.slice(5)}@fci.helwan.edu.eg`;
  const nationalId = `2990101${randomSuffix.slice(0, 7)}`;
  const phoneNumber = `010${randomSuffix}`;

  return { username, email, nationalId, phoneNumber };
};

const buildSignupFormData = ({
  username,
  email,
  nationalId,
  phoneNumber,
  password = "Pass1234#",
  nationalityId = "1",
  levelId = "5",
  govId = "15",
  facultyId = "10",
  gender = "ذكر",
  birthDate = "2000-01-01",
  photoField = "user_profile_photo",
  photoBlob = new Blob(["fake-photo-data"], { type: "image/jpeg" }),
  photoFilename = "profile.jpg",
  nidBlob = new Blob(["fake-nid-data"], { type: "image/jpeg" }),
  nidFilename = "national-id.jpg",
  feesBlob = new Blob(["%PDF-1.4 fake-fees-data"], { type: "application/pdf" }),
  feesFilename = "fees.pdf",
  omitPhoto = false,
  omitNid = false,
  omitFees = false,
}) => {
  const form = new FormData();
  form.append("username", username);
  form.append("email", email);
  form.append("password", password);
  form.append("national_id", nationalId);
  form.append("nationality_id", nationalityId);
  form.append("level_id", levelId);
  form.append("gov_id", govId);
  form.append("faculty_id", facultyId);
  form.append("gender", gender);
  form.append("birth_date", birthDate);
  form.append("phone_number", phoneNumber);

  if (!omitPhoto && photoBlob) {
    form.append(photoField, photoBlob, photoFilename);
  }
  if (!omitNid && nidBlob) {
    form.append("national_id_file", nidBlob, nidFilename);
  }
  if (!omitFees && feesBlob) {
    form.append("fees_file", feesBlob, feesFilename);
  }

  return form;
};

const cleanupUser = async (email, username) => {
  try {
    await pool.query("DELETE FROM email_verification_otps WHERE email = ?", [email]);
    await pool.query("DELETE FROM users WHERE email = ?", [email]);
    if (username) {
      const studentDir = path.join(process.cwd(), "uploads", "students", username);
      await fs.rm(studentDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`Error cleaning up test user ${email}:`, error.message);
  }
};

describe("Signup File Upload Flow", () => {
  before(async () => {
    // Check if external server is reachable; if not, spin up in-process app instance
    try {
      const ping = await fetch(`${baseUrl}/api/v1/auth/signup`, { method: "OPTIONS" });
      if (!ping) throw new Error("Server not responding");
    } catch {
      const { default: app } = await import("../app.js");
      serverInstance = app.listen(0);
      const port = serverInstance.address().port;
      baseUrl = `http://localhost:${port}`;
    }
  });

  after(async () => {
    for (const item of testUsersToCleanup) {
      await cleanupUser(item.email, item.username);
    }
    for (const dir of testDirsToCleanup) {
      await fs.rm(path.join(process.cwd(), "uploads", "students", dir), {
        recursive: true,
        force: true,
      });
    }

    if (serverInstance) {
      serverInstance.close();
    }

    await pool.end();
  });

  it("1. Successfully registers student with user_profile_photo and saves files correctly", async () => {
    const creds = generateTestCredentials("upld_p");
    testUsersToCleanup.add(creds);
    testDirsToCleanup.add(creds.username);

    const form = buildSignupFormData({
      ...creds,
      photoField: "user_profile_photo",
    });

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: "POST",
      body: form,
    });

    assert.equal(response.status, 201, "Expected HTTP 201 Created");
    const json = await response.json();
    assert.equal(json.status, "success");
    assert.equal(json.email, creds.email);
    assert.equal(json.requiresVerification, true);

    // Verify DB record
    const [rows] = await pool.query(
      "SELECT username, email, user_image_path, national_id_path, fees_path FROM users WHERE email = ?",
      [creds.email],
    );
    assert.equal(rows.length, 1, "User should be present in database");
    const user = rows[0];

    assert.match(user.user_image_path, /^students\/[^\/]+\/profile-.*\.jpeg$/);
    assert.match(user.national_id_path, /^students\/[^\/]+\/national-id-.*\.jpeg$/);
    assert.match(user.fees_path, /^students\/[^\/]+\/fees-.*\.pdf$/);

    // Verify files on filesystem
    const diskProfilePath = path.join(process.cwd(), "uploads", user.user_image_path);
    const diskNidPath = path.join(process.cwd(), "uploads", user.national_id_path);
    const diskFeesPath = path.join(process.cwd(), "uploads", user.fees_path);

    await assert.doesNotReject(fs.stat(diskProfilePath), "Profile photo must exist on disk");
    await assert.doesNotReject(fs.stat(diskNidPath), "National ID file must exist on disk");
    await assert.doesNotReject(fs.stat(diskFeesPath), "Fees PDF file must exist on disk");
  });

  it("2. Successfully registers student with PNG user_profile_photo", async () => {
    const creds = generateTestCredentials("upld_png");
    testUsersToCleanup.add(creds);
    testDirsToCleanup.add(creds.username);

    const form = buildSignupFormData({
      ...creds,
      photoField: "user_profile_photo",
      photoBlob: new Blob(["fake-png-content"], { type: "image/png" }),
      photoFilename: "avatar.png",
    });

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: "POST",
      body: form,
    });

    assert.equal(response.status, 201, "Expected HTTP 201 Created for PNG profile photo");
    const json = await response.json();
    assert.equal(json.status, "success");

    const [rows] = await pool.query(
      "SELECT user_image_path FROM users WHERE email = ?",
      [creds.email],
    );
    assert.equal(rows.length, 1);
    assert.match(rows[0].user_image_path, /^students\/[^\/]+\/profile-.*\.jpeg$/);
  });

  it("3. Rejects unsupported file formats with HTTP 400", async () => {
    const creds = generateTestCredentials("bad_fmt");

    const form = buildSignupFormData({
      ...creds,
      photoBlob: new Blob(["plain text file"], { type: "text/plain" }),
      photoFilename: "malicious.txt",
    });

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: "POST",
      body: form,
    });

    assert.equal(response.status, 400, "Expected HTTP 400 Bad Request for unsupported file type");
    const json = await response.json();
    assert.equal(json.status, "fail");
    assert.match(
      json.message || JSON.stringify(json.errors),
      /Only image files \(JPG, PNG, WebP\) and PDFs are allowed!/i,
    );
  });

  it("4. Rejects signup when user_profile_photo is missing", async () => {
    const creds = generateTestCredentials("no_photo");

    const form = buildSignupFormData({
      ...creds,
      omitPhoto: true,
    });

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: "POST",
      body: form,
    });

    assert.equal(response.status, 400, "Expected HTTP 400 for missing photo");
    const json = await response.json();
    assert.equal(json.status, "fail");
    assert.ok(
      json.errors?.some((e) => e.includes("user profile photo is required")),
      "Should report missing photo error",
    );
  });

  it("5. Rejects signup when national_id_file is missing", async () => {
    const creds = generateTestCredentials("no_nid");

    const form = buildSignupFormData({
      ...creds,
      omitNid: true,
    });

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: "POST",
      body: form,
    });

    assert.equal(response.status, 400, "Expected HTTP 400 for missing national ID file");
    const json = await response.json();
    assert.equal(json.status, "fail");
    assert.ok(
      json.errors?.some((e) => e.includes("national id file is required")),
      "Should report missing national ID file error",
    );
  });

  it("6. Rejects signup when fees_file is missing", async () => {
    const creds = generateTestCredentials("no_fees");

    const form = buildSignupFormData({
      ...creds,
      omitFees: true,
    });

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: "POST",
      body: form,
    });

    assert.equal(response.status, 400, "Expected HTTP 400 for missing fees file");
    const json = await response.json();
    assert.equal(json.status, "fail");
    assert.ok(
      json.errors?.some((e) => e.includes("fees file is required")),
      "Should report missing fees file error",
    );
  });

  it("7. Rejects files exceeding the 10 MB limit", async () => {
    const creds = generateTestCredentials("big_file");

    // Create an 11 MB buffer
    const oversizedBuffer = new Uint8Array(11 * 1024 * 1024);
    const oversizedBlob = new Blob([oversizedBuffer], { type: "image/jpeg" });

    const form = buildSignupFormData({
      ...creds,
      photoBlob: oversizedBlob,
    });

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: "POST",
      body: form,
    });

    assert.equal(response.status, 400, "Expected HTTP 400 for file size > 10MB");
    const json = await response.json();
    assert.equal(json.status, "fail");
    assert.match(
      json.message || JSON.stringify(json.errors),
      /File too large|كبير جداً|الحد الأقصى|خطأ في رفع الملف/i,
    );
  });
});
