// IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";
import { StatusCode } from "../../utils/status-codes.js";
import { auditLog } from "../../utils/audit-log.js";
import { pick } from "../../utils/pick-from-body-request.js";
import * as service from "./resrervation.service.js";
import * as resource from "./reservation.resource.js";

const parseMonth = (val) => {
  if (!val) return null;
  const num = parseInt(val, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) return num;
  const names = {
    january: 1, jan: 1,
    february: 2, feb: 2,
    march: 3, mar: 3,
    april: 4, apr: 4,
    may: 5,
    june: 6, jun: 6,
    july: 7, jul: 7,
    august: 8, aug: 8,
    september: 9, sep: 9, sept: 9,
    october: 10, oct: 10,
    november: 11, nov: 11,
    december: 12, dec: 12,
  };
  const key = String(val).trim().toLowerCase();
  return names[key] || null;
};

// ==========================================
// Emergency / Counter Reservations Endpoints (Admin)
// ==========================================

//@desc     submit medical examination request (emergency / counter)
//@route    POST /api/v1/Reservations
//@access   private (SUPER_ADMIN, COUNTER)
export const adminCreateRequest = asyncHandler(async (req, res) => {
  const allowedFields = [
    "Name",
    "name",
    "patient_name",
    "national_id",
    "phone_number",
    "level_id",
    "clinic_id",
    "gov_id",
    "faculty_id",
    "nationality_id",
    "user_id",
  ];
  const data = pick(req.body, allowedFields);

  const newId = await service.createEmergencyReservation(data, req.user);
  return res.status(StatusCode.OK).json({ message: "تم الحجز بنجاح", id: newId });
});

//@desc     modify medical examination request (emergency / counter)
//@route    PUT /api/v1/Reservations/:id
//@access   private (SUPER_ADMIN, COUNTER)
export const adminUpdateRequest = asyncHandler(async (req, res) => {
  const reservationId = req.params.emergencyUser_id || req.params.id;
  const allowedFields = [
    "Name",
    "name",
    "patient_name",
    "national_id",
    "phone_number",
    "clinic_id",
  ];
  const data = pick(req.body, allowedFields);

  await service.updateEmergencyReservation(reservationId, data, req.user);
  return res.status(StatusCode.OK).json({ message: "تم تعديل الحجز بنجاح" });
});

//@desc     view medical examination request (by ID)
//@route    GET /api/v1/Reservations/:id
//@access   private
export const adminViewRequest = asyncHandler(async (req, res) => {
  const reservationId = req.params.emergencyUser_id || req.params.id;
  const results = await service.getEmergencyReservationById(reservationId);
  return res
    .status(StatusCode.OK)
    .json(resource.toSingleEmergencyReservationResource(results, req));
});

//@desc     view list of medical examinations (all or filtered by examType, month, year, clinic_id, status)
//@route    GET /api/v1/Reservations
//@access   private
export const adminGetAllReservations = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const searchKey = req.query.searchKey || "";
  const examType = req.query.examType || req.query.exam_type || null;
  const month = parseMonth(req.query.month);
  const year = req.query.year ? parseInt(req.query.year, 10) : null;
  const clinicId = req.query.clinic_id || req.query.clinicId || null;
  const status = req.query.status || null;
  const date = req.query.date || null;
  const facultyId = req.query.faculty_id || req.query.facultyId || null;
  const levelId = req.query.level_id || req.query.levelId || null;
  const gender = req.query.gender || null;
  const nationalityId = req.query.nationality_id || req.query.nationalityId || null;

  const responseData = await service.getAllAdminReservations({
    page,
    limit,
    searchKey,
    examType,
    month,
    year,
    clinicId,
    status,
    date,
    facultyId,
    levelId,
    gender,
    nationalityId,
  });

  return res.status(StatusCode.OK).json({
    totalPages: responseData.totalPages,
    currentPage: responseData.currentPage,
    results: resource.toAdminReservationsListResource(
      responseData.results,
      req,
    ),
  });
});

//@desc     view list of emergency medical examinations
//@route    GET /api/v1/Reservations/emergency, GET /api/v1/EmergencyReservations
//@access   private
export const adminGetAllEmergencyReservations = asyncHandler(
  async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const searchKey = req.query.searchKey || "";
    const month = parseMonth(req.query.month);
    const year = req.query.year ? parseInt(req.query.year, 10) : null;

    const responseData = await service.getAllEmergencyReservations({
      page,
      limit,
      searchKey,
      month,
      year,
    });

    return res.status(StatusCode.OK).json({
      totalPages: responseData.totalPages,
      currentPage: responseData.currentPage,
      results: resource.toEmergencyReservationsListResource(
        responseData.results,
        req,
      ),
    });
  },
);

//@desc     delete medical examination request
//@route    DELETE /api/v1/Reservations/:id
//@access   private (SUPER_ADMIN, COUNTER)
export const adminDeleteRequest = asyncHandler(async (req, res) => {
  const reservationId = req.params.emergencyUser_id || req.params.id;
  await service.deleteEmergencyReservation(reservationId, req.user);
  return res.status(StatusCode.OK).json({ message: "تم حذف الحجز بنجاح" });
});

// ==========================================
// Student / User Medical Examination Endpoints
// ==========================================

//@desc     submit medical examination request
//@route    POST /api/v1/myreservations
//@access   public
export const createRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { clinic_id, date, examType } = req.body;

  await service.createReservation(userId, { clinic_id, date, examType });
  return res.status(StatusCode.CREATED).json({ message: "تم حجز الكشف بنجاح" });
});

//@desc     modify medical examination request
//@route    PUT /api/v1/myreservations/:medicEx_id
//@access   public
export const updateRequest = asyncHandler(async (req, res) => {
  const reservationId = req.params.medicEx_id || req.params.id;
  const { clinic_id, date, examType } = req.body;

  await service.updateReservation(reservationId, { clinic_id, date, examType });
  return res
    .status(StatusCode.CREATED)
    .json({ message: "تم تعديل الحجز بنجاح", medicEx_id: reservationId, id: reservationId });
});

//@desc     view medical examination request (single by ID)
//@route    GET /api/v1/myreservations/:student_id/:medicEx_id
//@access   public
export const viewRequest = asyncHandler(async (req, res) => {
  const reservationId = req.params.medicEx_id || req.params.id;
  const results = await service.getReservationById(reservationId);
  return res
    .status(StatusCode.OK)
    .json(resource.toSingleReservationResource(results, req));
});

//@desc     view all my medical examinations (user list)
//@route    GET /api/v1/myreservations
//@access   public
export const getMyReservations = asyncHandler(async (req, res) => {
  const userId =
    req.query?.user_id ||
    req.query?.student_id ||
    req.params?.user_id ||
    req.params?.student_id ||
    req.user?.id;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);

  const isApproved =
    Boolean(req.user?.role) ||
    (Boolean(req.user?.is_active) && req.user?.document_status === "approved");

  if (!isApproved) {
    return res.status(StatusCode.OK).json({
      totalPages: 0,
      currentPage: page,
      results: [],
    });
  }

  const responseData = await service.getMyReservations({
    user_id: userId,
    student_id: userId,
    page,
    limit,
  });

  return res.status(StatusCode.OK).json({
    totalPages: responseData.totalPages,
    currentPage: responseData.currentPage,
    results: resource.toMyReservationsListResource(
      responseData.results,
      req,
    ),
  });
});

//@desc     cancel request only if not already accepted
//@route    DELETE /api/v1/myreservations/:medicEx_id
//@access   public
export const cancelRequest = asyncHandler(async (req, res) => {
  const reservationId = req.params.medicEx_id || req.params.id;
  await service.cancelReservation(reservationId);
  return res.status(StatusCode.OK).json({ message: "تم الغاء الكشف بنجاح" });
});

//@desc     accept reservation or decline it
//@route    PUT /api/v1/Reservations/:id
//@access   private
export const isAccepted = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const accepted = await service.isAccepted(id, status);

  const auditData = {
    adminId: req.user.id,
    method: accepted ? "قبول طلب كشف" : "رفض طلب كشف",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);

  return res.status(StatusCode.OK).json({
    message: accepted ? "تم قبول الكشف" : "تم رفض الكشف",
    data: resource.toAcceptStatusResource(id, accepted),
  });
});
