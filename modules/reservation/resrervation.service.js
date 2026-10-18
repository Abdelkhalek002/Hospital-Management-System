import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import Reservation from "./reservation.repository.js";
import Base from "../../repositories/base.repository.js";
import { isLimitReached } from "./reservation.validator.js";
import { auditLog } from "../../utils/audit-log.js";
import { queryOne } from "../../config/db-helpers.js";

export const formatCairoTime = (date) => {
  if (!date) return date;
  return new Date(date).toLocaleString("en-US", {
    timeZone: "Africa/Cairo",
  });
};

export const isAccepted = async (id, status) => {
  if (status === true || status === "true")
    return await new Reservation().accept(id);
  if (status === false || status === "false")
    return !(await new Reservation().decline(id));
  throw new ApiError(
    "error receiving operation data (only true or false)",
    StatusCode.BAD_REQUEST,
  );
};

export const createReservation = async (
  userId,
  { clinic_id, date, examType },
) => {
  // 1- check if reservation limit reached
  const results = await new Reservation().findByDate(date);
  if (isLimitReached(null, results)) {
    throw new ApiError("reservations limit reached!", StatusCode.BAD_REQUEST);
  }

  // check if user exceeded limit of 1 reservation per day
  const dailyCount = await new Reservation().countByUserAndDate(
    userId,
    date,
  );
  if (dailyCount >= 1) {
    throw new ApiError(
      "تجاوزت الحد الاقصى للحجوزات اليومية",
      StatusCode.TOO_MANY_REQUESTS,
    );
  }

  // 2- check if user exists
  const user = await new Base("users").findById(userId);
  if (!user) {
    throw new ApiError(
      `المستخدم ${userId} غير موجود`,
      StatusCode.BAD_REQUEST,
    );
  }

  // 3- insert reservation
  return await new Reservation().create({
    user_id: userId,
    student_id: userId,
    clinic_id,
    date,
    examType: examType || "كشف جديد",
    status: "تحت الانتظار",
  });
};

export const updateReservation = async (
  reservationId,
  { clinic_id, date, examType, status, patient_name, national_id, phone_number },
) => {
  const reservation = await new Reservation().findById(reservationId);
  if (!reservation) {
    throw new ApiError(
      `الكشف رقم ${reservationId} غير موجود`,
      StatusCode.NOT_FOUND,
    );
  }

  await new Reservation().update(reservationId, {
    clinic_id,
    date,
    examType,
    status,
    patient_name,
    national_id,
    phone_number,
  });
  return reservationId;
};

export const getReservationById = async (reservationId) => {
  const results = await new Reservation().findByIdWithClinic(reservationId);
  if (!results || results.length === 0) {
    throw new ApiError(
      `الكشف رقم ${reservationId} غير موجود`,
      StatusCode.NOT_FOUND,
    );
  }
  return results;
};

export const getMyReservations = async ({ user_id, student_id, page, limit }) => {
  const targetId = user_id ?? student_id;
  const result = await new Reservation().getUserReservations({
    user_id: targetId,
    page,
    limit,
  });

  (result.data || []).forEach((row) => {
    if (row.date) {
      row.date = formatCairoTime(row.date);
    }
  });

  return {
    totalPages: result.totalPages,
    currentPage: page,
    results: result.data || [],
  };
};

export const cancelReservation = async (reservationId) => {
  const reservation = await new Reservation().findById(reservationId);
  if (!reservation) {
    throw new ApiError("الكشف غير موجود", StatusCode.NOT_FOUND);
  }

  if (reservation.status === "مقبول") {
    throw new ApiError(
      "لا يمكن الغاء الكشف لانه تم قبوله",
      StatusCode.BAD_REQUEST,
    );
  }

  return await new Reservation().delete(reservationId);
};

export const getAllAdminReservations = async ({
  page,
  limit,
  searchKey = "",
  examType = null,
  month = null,
  year = null,
  clinicId = null,
  status = null,
}) => {
  const result = await new Reservation().getAllAdminReservations({
    page,
    limit,
    searchKey,
    examType,
    month,
    year,
    clinicId,
    status,
  });

  (result.data || []).forEach((row) => {
    if (row.date) {
      row.date = formatCairoTime(row.date);
    }
  });

  return {
    totalPages: result.totalPages,
    currentPage: page,
    results: result.data || [],
  };
};

// Emergency Reservations (counter admin flow)
export const createEmergencyReservation = async (data, user) => {
  let linkedUserId = data.user_id || null;

  // Auto-link: If national_id matches an existing registered user, link user_id
  if (!linkedUserId && data.national_id) {
    const existingUser = await queryOne(
      `SELECT id, username, phone_number FROM users WHERE national_id = ? LIMIT 1`,
      [String(data.national_id)],
    );
    if (existingUser) {
      linkedUserId = existingUser.id;
    }
  }

  const reservationData = {
    user_id: linkedUserId,
    patient_name: data.Name || data.patient_name || data.patientName || null,
    national_id: data.national_id != null ? String(data.national_id) : null,
    phone_number: data.phone_number || null,
    clinic_id: data.clinic_id || null,
    date: data.date || new Date(),
    examType: "طواريْ",
    status: "مقبول",
  };

  const id = await new Reservation().create(reservationData);
  const adminId = user?.id || user?.user_id || user?.[0]?.superAdmin_id;
  if (adminId) {
    await auditLog({
      adminId,
      method: "حجز كشف عاجل",
      createdAt: new Date().toISOString(),
    });
  }
  return id;
};

export const updateEmergencyReservation = async (
  reservationId,
  data,
  user,
) => {
  const item = await new Reservation().findById(reservationId);
  if (!item) {
    throw new ApiError(
      "Emergency Reservation ID not found",
      StatusCode.NOT_FOUND,
    );
  }

  await new Reservation().update(reservationId, {
    patient_name: data.Name || data.patient_name || data.patientName,
    national_id: data.national_id,
    clinic_id: data.clinic_id,
    phone_number: data.phone_number,
  });

  const adminId = user?.id || user?.user_id || user?.[0]?.superAdmin_id;
  if (adminId) {
    await auditLog({
      adminId,
      method: "تعديل حجز كشف عاجل",
      createdAt: new Date().toISOString(),
    });
  }
};

export const getEmergencyReservationById = async (reservationId) => {
  const results = await new Reservation().findByIdWithClinic(reservationId);
  if (!results || results.length === 0) {
    throw new ApiError(
      "Emergency Reservation ID not found",
      StatusCode.NOT_FOUND,
    );
  }
  return results;
};

export const getAllEmergencyReservations = async ({ page, limit, searchKey = "", month = null, year = null }) => {
  const result = await new Reservation().getAllAdminReservations({
    page,
    limit,
    searchKey,
    examType: "طواريْ",
    month,
    year,
  });

  (result.data || []).forEach((row) => {
    if (row.date) {
      row.date = formatCairoTime(row.date);
    }
  });

  return {
    totalPages: result.totalPages,
    currentPage: page,
    results: result.data || [],
  };
};

export const deleteEmergencyReservation = async (reservationId, user) => {
  const item = await new Reservation().findById(reservationId);
  if (!item) {
    throw new ApiError("الكشف غير موجود ", StatusCode.NOT_FOUND);
  }

  await new Reservation().delete(reservationId);
  const adminId = user?.id || user?.user_id || user?.[0]?.superAdmin_id;
  if (adminId) {
    await auditLog({
      adminId,
      method: "حذف حجز كشف عاجل",
      createdAt: new Date().toISOString(),
    });
  }
};
