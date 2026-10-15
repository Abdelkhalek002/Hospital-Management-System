import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import Reservation from "./reservation.repository.js";
import EmergencyReservation from "./emergency-reservation.repository.js";
import Base from "../../repositories/base.repository.js";
import { isLimitReached } from "./reservation.validator.js";
import { auditLog } from "../../utils/audit-log.js";

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

export const getReservationsPerMonth = async () => {
  return await new Reservation().getPerMonth();
};

export const createReservation = async (
  student_id,
  { clinic_id, date, examType },
) => {
  // 1- check if reservation limit reached
  const results = await new Reservation().findByDate(date);
  if (isLimitReached(null, results)) {
    throw new ApiError("reservations limit reached!", StatusCode.BAD_REQUEST);
  }

  // check if user exceeded limit of 1 reservation per day
  const dailyCount = await new Reservation().countByStudentAndDate(
    student_id,
    date,
  );
  if (dailyCount >= 1) {
    throw new ApiError(
      "تجاوزت الحد الاقصى للحجوزات اليومية",
      StatusCode.TOO_MANY_REQUESTS,
    );
  }

  // 2- check if user exists
  const student = await new Base("students").findById(student_id);
  if (!student) {
    throw new ApiError(
      `المستخدم ${student_id} غير موجود`,
      StatusCode.BAD_REQUEST,
    );
  }

  // 3- insert reservation
  return await new Reservation().create({
    student_id,
    clinic_id,
    date,
    examType,
  });
};

export const updateReservation = async (
  medicEx_id,
  { clinic_id, date, examType },
) => {
  const reservation = await new Reservation().findById(medicEx_id);
  if (!reservation) {
    throw new ApiError(
      `الكشف رقم ${medicEx_id} غير موجود`,
      StatusCode.NOT_FOUND,
    );
  }

  await new Reservation().update(medicEx_id, { clinic_id, date, examType });
  return medicEx_id;
};

export const getReservationById = async (medicEx_id) => {
  const results = await new Reservation().findByIdWithClinic(medicEx_id);
  if (!results || results.length === 0) {
    throw new ApiError(
      `الكشف رقم ${medicEx_id} غير موجود`,
      StatusCode.NOT_FOUND,
    );
  }
  return results;
};

export const getMyReservations = async ({ student_id, page, limit }) => {
  const result = await new Reservation().getStudentReservations({
    student_id,
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

export const cancelReservation = async (medicEx_id) => {
  const reservation = await new Reservation().findById(medicEx_id);
  if (!reservation) {
    throw new ApiError("الكشف غير موجود", StatusCode.NOT_FOUND);
  }

  if (reservation.status === "مقبول") {
    throw new ApiError(
      "لا يمكن الغاء الكشف لانه تم قبوله",
      StatusCode.BAD_REQUEST,
    );
  }

  return await new Reservation().delete(medicEx_id);
};

export const getAllAdminReservations = async ({
  page,
  limit,
  searchKey = "",
}) => {
  const result = await new Reservation().getAllAdminReservations({
    page,
    limit,
    searchKey,
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

// Emergency Reservations
export const createEmergencyReservation = async (data, user) => {
  const id = await new EmergencyReservation().create(data);
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
  emergencyUser_id,
  data,
  user,
) => {
  const item = await new EmergencyReservation().findById(emergencyUser_id);
  if (!item) {
    throw new ApiError(
      "Emergency Reservation ID not found",
      StatusCode.NOT_FOUND,
    );
  }

  await new EmergencyReservation().update(emergencyUser_id, data);
  const adminId = user?.id || user?.user_id || user?.[0]?.superAdmin_id;
  if (adminId) {
    await auditLog({
      adminId,
      method: "تعديل حجز كشف عاجل",
      createdAt: new Date().toISOString(),
    });
  }
};

export const getEmergencyReservationById = async (emergencyUser_id) => {
  const item = await new EmergencyReservation().findById(emergencyUser_id);
  if (!item) {
    throw new ApiError(
      "Emergency Reservation ID not found",
      StatusCode.NOT_FOUND,
    );
  }
  return [item];
};

export const getAllEmergencyReservations = async ({ page, limit }) => {
  const result = await new EmergencyReservation().getAll({ page, limit });

  (result.data || []).forEach((row) => {
    if (row.time) {
      row.time = formatCairoTime(row.time);
    }
  });

  return {
    totalPages: result.totalPages,
    currentPage: page,
    results: result.data || [],
  };
};

export const deleteEmergencyReservation = async (emergencyUser_id, user) => {
  const item = await new EmergencyReservation().findById(emergencyUser_id);
  if (!item) {
    throw new ApiError("الكشف غير موجود ", StatusCode.NOT_FOUND);
  }

  await new EmergencyReservation().delete(emergencyUser_id);
  const adminId = user?.id || user?.user_id || user?.[0]?.superAdmin_id;
  if (adminId) {
    await auditLog({
      adminId,
      method: "حذف حجز كشف عاجل",
      createdAt: new Date().toISOString(),
    });
  }
};
