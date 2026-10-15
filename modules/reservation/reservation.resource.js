/**
 * DTO / Resource transformers for Reservation responses.
 * Each endpoint has its own dedicated resource transformer for independent control.
 */

/**
 * Format any file/image path into a fully qualified URL.
 */
export const formatImageUrl = (filePath, req = null) => {
  if (!filePath) return null;
  const str = String(filePath).trim();
  if (!str) return null;

  if (str.startsWith("http://") || str.startsWith("https://")) {
    return encodeURI(str);
  }

  let cleanPath = str.replace(/\\/g, "/").replace(/^\/+/, "");

  if (cleanPath.startsWith("api/v1/uploads/")) {
    cleanPath = cleanPath.replace(/^api\/v1\/uploads\//, "");
  } else if (cleanPath.startsWith("uploads/")) {
    cleanPath = cleanPath.replace(/^uploads\//, "");
  }

  const encodedPath = cleanPath
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");

  const base =
    req && typeof req.get === "function"
      ? `${req.protocol}://${req.get("host")}`
      : process.env.BASE_URL || `http://localhost:${process.env.PORT || 7000}`;

  return `${base}/api/v1/uploads/${encodedPath}`;
};

// ==========================================
// 1. Single Reservation by ID (viewRequest)
// ==========================================
export const toSingleReservationResource = (reservation, req = null) => {
  if (!reservation) return null;
  const item = Array.isArray(reservation) ? reservation[0] : reservation;
  if (!item) return null;

  const result = {
    id: item.id,
    clinicId: item.clinic_id,
    clinicName: item.clinic_name,
    examType: item.exam_type ?? item.examType,
    status: item.status,
    date: item.date,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };

  if (item.user_image_file || item.userImage) {
    result.userImage = formatImageUrl(
      item.user_image_file ?? item.userImage,
      req,
    );
  }

  return result;
};

// ==========================================
// 2. Student Reservations List (getMyReservations)
// ==========================================
export const toMyReservationsListResource = (items = [], req = null) => {
  return items.map((item) => {
    const res = {
      id: item.id,
      clinicId: item.clinic_id,
      clinicName: item.clinic_name,
      examType: item.exam_type ?? item.examType,
      status: item.status,
      date: item.date,
      transfer:
        item.transferReason || item.ex_hosp_name
          ? {
              transferReason: item.transferReason,
              notes: item.notes,
              externalHospital: item.ex_hosp_name,
            }
          : null,
    };

    if (item.user_image_file || item.userImage) {
      res.userImage = formatImageUrl(
        item.user_image_file ?? item.userImage,
        req,
      );
    }

    return res;
  });
};

// ==========================================
// 3. Admin All Reservations List (adminGetAllReservations)
// ==========================================
export const toAdminReservationsListResource = (items = [], req = null) => {
  return items.map((item) => ({
    id: item.id,
    examType: item.exam_type ?? item.examType,
    status: item.status,
    date: item.date,
    clinic: {
      id: item.clinic_id,
      name: item.clinic_name,
    },
    level: item.level_name,
    student: {
      id: item.student_id,
      name: item.student_name,
      nationalId: item.national_id,
      userImage: formatImageUrl(item.user_image_file ?? item.userImage, req),
    },
  }));
};

// ==========================================
// 4. Single Emergency Reservation by ID (adminViewRequest)
// ==========================================
export const toSingleEmergencyReservationResource = (item, _req = null) => {
  if (!item) return null;
  const row = Array.isArray(item) ? item[0] : item;
  if (!row) return null;

  return {
    id: row.emergencyUser_id,
    name: row.Name,
    nationalId: row.national_id,
    clinicId: row.clinic_id,
    levelId: row.level_id,
    facultyId: row.faculty_id,
    govId: row.gov_id,
    nationalityId: row.nationality_id,
    time: row.time,
  };
};

// ==========================================
// 5. Emergency Reservations List (adminGetAllEmergencyReservations)
// ==========================================
export const toEmergencyReservationsListResource = (
  items = [],
  _req = null,
) => {
  return items.map((item) => ({
    id: item.emergencyUser_id,
    name: item.Name,
    nationalId: item.national_id,
    time: item.time,
    clinicName: item.clinic_name,
    levelName: item.level_name,
    facultyName: item.faculty_name,
    govName: item.gov_name,
    nationality: item.Nationlaity,
  }));
};

// ==========================================
// 6. Accept / Decline Status (isAccepted)
// ==========================================
export const toAcceptStatusResource = (id, accepted) => ({
  id: Number(id),
  accepted,
  status: accepted ? "مقبول" : "مرفوض",
});

// Generic fallbacks / aliases
export const toReservationResource = toSingleReservationResource;
export const toReservationCollection = toMyReservationsListResource;
export const toEmergencyReservationResource =
  toSingleEmergencyReservationResource;
export const toEmergencyReservationCollection =
  toEmergencyReservationsListResource;
