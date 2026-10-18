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
    patientName: item.patient_name || item.user_name || null,
    nationalId: item.national_id != null ? String(item.national_id) : null,
    phoneNumber: item.phone_number || null,
  };

  const imagePath =
    item.user_image_path || item.user_image_file || item.userImage;
  if (imagePath) {
    result.userImage = formatImageUrl(imagePath, req);
  }

  return result;
};

// ==========================================
// 2. Student / User Reservations List (getMyReservations)
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

    const imagePath =
      item.user_image_path || item.user_image_file || item.userImage;
    if (imagePath) {
      res.userImage = formatImageUrl(imagePath, req);
    }

    return res;
  });
};

// ==========================================
// 3. Admin All Reservations List (adminGetAllReservations)
// ==========================================
export const toAdminReservationsListResource = (items = [], req = null) => {
  return items.map((item) => {
    const userId = item.user_id ?? item.student_id ?? null;
    const userName = item.user_name ?? item.student_name ?? item.patient_name ?? item.Name;
    const rawImage = item.user_image_path || item.user_image_file || item.userImage;
    const userImgUrl = formatImageUrl(rawImage, req);

    const userObj = {
      id: userId,
      name: userName,
      national_id: item.national_id != null ? String(item.national_id) : null,
      phone_number: item.phone_number || null,
      profile_photo_url: userImgUrl,
      is_walk_in: !userId,
    };

    return {
      id: item.id,
      examType: item.examType,
      status: item.status,
      date: item.date,
      clinic: item.clinic_name,
      level: item.level_name,
      user: userObj,
    };
  });
};

// ==========================================
// 4. Single Emergency Reservation by ID (adminViewRequest)
// ==========================================
export const toSingleEmergencyReservationResource = (item, req = null) => {
  if (!item) return null;
  const row = Array.isArray(item) ? item[0] : item;
  if (!row) return null;

  const rawImage = row.user_image_path || row.user_image_file || row.userImage;
  const userImgUrl = formatImageUrl(rawImage, req);

  return {
    id: row.id,
    emergencyUser_id: row.id,
    name: row.patient_name || row.Name || row.user_name || row.username,
    nationalId: row.national_id != null ? String(row.national_id) : null,
    phoneNumber: row.phone_number || null,
    clinicId: row.clinic_id,
    clinicName: row.clinic_name,
    levelId: row.level_id,
    facultyId: row.faculty_id,
    govId: row.gov_id,
    nationalityId: row.nationality_id,
    time: row.date,
    date: row.date,
    examType: row.exam_type,
    status: row.status,
    userImage: userImgUrl,
  };
};

// ==========================================
// 5. Emergency Reservations List (adminGetAllEmergencyReservations)
// ==========================================
export const toEmergencyReservationsListResource = (
  items = [],
  req = null,
) => {
  return items.map((item) => {
    const rawImage = item.user_image_path || item.user_image_file || item.userImage;
    const userImgUrl = formatImageUrl(rawImage, req);
    const displayName = item.patient_name || item.Name || item.user_name || item.student_name;
    const nationalId = item.national_id != null ? String(item.national_id) : null;

    return {
      id: item.id,
      emergencyUser_id: item.id,
      name: displayName,
      nationalId,
      phoneNumber: item.phone_number,
      time: item.date,
      date: item.date,
      clinicName: item.clinic_name,
      levelName: item.level_name,
      facultyName: item.faculty_name,
      govName: item.gov_name,
      nationality: item.Nationlaity || item.nationality_name,
      userImage: userImgUrl,
    };
  });
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
