// IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";
import { StatusCode } from "../../utils/status-codes.js";
import { auditLog } from "../../utils/audit-log.js";
import { pick } from "../../utils/pick-from-body-request.js";
import * as service from "./resrervation.service.js";
import * as resource from "./reservation.resource.js";

// ==========================================
// Emergency Reservations Endpoints (Admin)
// ==========================================

//@desc     submit medical examination request (emergency)
//@route    POST /api/v1/Reservations
//@access   private (SUPER_ADMIN, COUNTER)
export const adminCreateRequest = asyncHandler(async (req, res) => {
  const allowedFields = [
    "Name",
    "national_id",
    "level_id",
    "clinic_id",
    "gov_id",
    "faculty_id",
    "nationality_id",
  ];
  const data = pick(req.body, allowedFields);

  await service.createEmergencyReservation(data, req.user);
  return res.status(StatusCode.OK).json({ message: "تم الحجز بنجاح" });
});

//@desc     modify medical examination request (emergency)
//@route    PUT /api/v1/Reservations/:emergencyUser_id
//@access   private (SUPER_ADMIN, COUNTER)
export const adminUpdateRequest = asyncHandler(async (req, res) => {
  const { emergencyUser_id } = req.params;
  const allowedFields = [
    "Name",
    "national_id",
    "level_id",
    "clinic_id",
    "gov_id",
    "faculty_id",
    "nationality_id",
  ];
  const data = pick(req.body, allowedFields);

  await service.updateEmergencyReservation(emergencyUser_id, data, req.user);
  return res.status(StatusCode.OK).json({ message: "تم تعديل الحجز بنجاح" });
});

//@desc     view medical examination request (emergency by ID)
//@route    GET /api/v1/Reservations/:emergencyUser_id
//@access   private
export const adminViewRequest = asyncHandler(async (req, res) => {
  const { emergencyUser_id } = req.params;
  const results = await service.getEmergencyReservationById(emergencyUser_id);
  return res
    .status(StatusCode.OK)
    .json(resource.toSingleEmergencyReservationResource(results));
});

//@desc     view list of medical examinations (all)
//@route    GET /api/v1/Reservations
//@access   private
export const adminGetAllReservations = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const searchKey = req.query.searchKey || "";

  const responseData = await service.getAllAdminReservations({
    page,
    limit,
    searchKey,
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
//@route    GET /api/v1/EmergencyReservations
//@access   private
export const adminGetAllEmergencyReservations = asyncHandler(
  async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);

    const responseData = await service.getAllEmergencyReservations({
      page,
      limit,
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

//@desc     delete medical examination request (emergency)
//@route    DELETE /api/v1/Reservations/:emergencyUser_id
//@access   private (SUPER_ADMIN, COUNTER)
export const adminDeleteRequest = asyncHandler(async (req, res) => {
  const { emergencyUser_id } = req.params;
  await service.deleteEmergencyReservation(emergencyUser_id, req.user);
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
  const { medicEx_id } = req.params;
  const { clinic_id, date, examType } = req.body;

  await service.updateReservation(medicEx_id, { clinic_id, date, examType });
  return res
    .status(StatusCode.CREATED)
    .json({ message: "تم تعديل الحجز بنجاح", medicEx_id });
});

//@desc     view medical examination request (single by ID)
//@route    GET /api/v1/myreservations/:student_id/:medicEx_id
//@access   public
export const viewRequest = asyncHandler(async (req, res) => {
  const { medicEx_id } = req.params;
  const results = await service.getReservationById(medicEx_id);
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
  const { medicEx_id } = req.params;
  await service.cancelReservation(medicEx_id);
  return res.status(StatusCode.OK).json({ message: "تم الغاء الكشف بنجاح" });
});

//@desc     get the number of reservations by each month from beginning of year
//@route    GET /api/v1/Reservations/byMonth
//@access   private
export const getReservationsPerMonth = asyncHandler(async (req, res) => {
  const months = await service.getReservationsPerMonth();
  return res.status(StatusCode.OK).json({
    msg: "success",
    data: months,
  });
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
