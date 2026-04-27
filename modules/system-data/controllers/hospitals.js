import asyncHandler from "express-async-handler";
import { query, queryOne } from "../../../config/db-helpers.js";
import { StatusCode } from "../../../utils/status-codes.js";

const getHospitalNameFromBody = (req) => req.body.hospital_name ?? req.body.hospName;
const getHospitalIdFromParams = (req) => req.params.id ?? req.params.exHosp_id;

//@desc     add new hospital
//@route    POST  /api/v1/sysdata/hospitals
//@access   private
export const createHospital = asyncHandler(async (req, res) => {
  const hospital_name = getHospitalNameFromBody(req);

  const existsSql =
    "SELECT 1 FROM external_hospitals WHERE hospital_name = ? LIMIT 1";
  const exists = await queryOne(existsSql, [hospital_name]);
  if (exists) {
    return res
      .status(StatusCode.CONFLICT)
      .json({ message: `Ù…Ø³ØªØ´ÙÙ‰ ${hospital_name} Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø§Ù„ÙØ¹Ù„` });
  }

  const insertSql = "INSERT INTO external_hospitals (hospital_name) VALUES (?)";
  const result = await query(insertSql, [hospital_name]);

  console.log("Hospital has been added successfully");
  return res.status(StatusCode.CREATED).json({
    message: `ØªÙ… Ø§Ø¶Ø§ÙØ© Ù…Ø³ØªØ´ÙÙ‰ ${hospital_name} Ø¨Ù†Ø¬Ø§Ø­`,
    id: result.insertId,
    hospital_name,
  });
});

//@desc     view list of hospitals
//@route    GET  /api/v1/sysdata/hospitals
//@access   private
export const getAllhospitals = asyncHandler(async (req, res) => {
  const sql = "SELECT * FROM external_hospitals ORDER BY id DESC";
  const results = await query(sql);
  console.log("Request created successfully");
  return res.status(StatusCode.OK).json(results);
});

//@desc     update hospital
//@route    PUT  /api/v1/sysdata/hospitals/:id
//@access   private
export const updateHospital = asyncHandler(async (req, res) => {
  const id = getHospitalIdFromParams(req);
  const hospital_name = getHospitalNameFromBody(req);

  const checkSql = "SELECT * FROM external_hospitals WHERE id = ? LIMIT 1";
  const hospital = await queryOne(checkSql, [id]);
  if (!hospital) {
    return res
      .status(StatusCode.NOT_FOUND)
      .json({ error: "Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø³ØªØ´ÙÙ‰" });
  }

  const existsSql =
    "SELECT 1 FROM external_hospitals WHERE hospital_name = ? AND id <> ? LIMIT 1";
  const exists = await queryOne(existsSql, [hospital_name, id]);
  if (exists) {
    return res
      .status(StatusCode.CONFLICT)
      .json({ message: `Ù…Ø³ØªØ´ÙÙ‰ ${hospital_name} Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø§Ù„ÙØ¹Ù„` });
  }

  const updateSql =
    "UPDATE external_hospitals SET hospital_name = ? WHERE id = ?";
  await query(updateSql, [hospital_name, id]);

  return res.status(StatusCode.OK).json({
    message: `ØªÙ… ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ø³ØªØ´ÙÙ‰ Ø¨Ù†Ø¬Ø§Ø­`,
    id: Number(id),
    hospital_name,
  });
});

//@desc     delete one hospital
//@route    DELETE  /api/v1/sysdata/hospitals/:id
//@access   private
export const deleteHospital = asyncHandler(async (req, res) => {
  const id = getHospitalIdFromParams(req);

  const checkSql = "SELECT * FROM external_hospitals WHERE id = ? LIMIT 1";
  const hospital = await queryOne(checkSql, [id]);
  if (!hospital) {
    return res
      .status(StatusCode.NOT_FOUND)
      .json({ error: "Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø³ØªØ´ÙÙ‰" });
  }

  const deleteSql = "DELETE FROM external_hospitals WHERE id = ?";
  await query(deleteSql, [id]);

  return res.status(StatusCode.OK).json({
    message: `ØªÙ… Ø­Ø°Ù Ø§Ù„Ø³ØªØ´ÙÙ‰ ${hospital.hospital_name} Ø¨Ù†Ø¬Ø§Ø­`,
    id: Number(id),
  });
});

