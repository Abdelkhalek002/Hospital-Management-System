/**
 * DTO / Resource transformers for Student responses.
 * Dedicated resource transformers for student profile and admin endpoints.
 */

/**
 * Format any file/image path into a fully qualified URL.
 */
export const formatStudentFileUrl = (filePath, username = null, req = null) => {
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

  // If path is a bare filename (not inside students/), prefix with students/<username> if provided
  if (!cleanPath.startsWith("students/") && username) {
    cleanPath = `students/${username}/${cleanPath}`;
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

const formatDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  const str = String(date).trim();
  return str.includes("T") ? str.split("T")[0] : str.slice(0, 10);
};

// ==========================================
// 1. Student Self Profile Resource (GET /me, PUT /me)
// ==========================================
export const toStudentProfileResource = (student, req = null) => {
  if (!student) return null;
  const item = Array.isArray(student) ? student[0] : student;
  if (!item) return null;

  const rawPhoto = item.user_image_file || item.photo || null;
  const profilePhotoUrl = formatStudentFileUrl(
    rawPhoto,
    item.username,
    req,
  );

  return {
    id: item.id,
    username: item.username,
    userName: item.username,
    email: item.email,
    phone_number: item.phone_number,
    phoneNumber: item.phone_number,
    profile_photo_url: profilePhotoUrl,
    user_image_file: profilePhotoUrl || rawPhoto,
    userImage_file: profilePhotoUrl || rawPhoto,
    photo: profilePhotoUrl || rawPhoto,
    national_id: item.national_id != null ? String(item.national_id) : null,
    gender: item.gender,
    birth_date: formatDate(item.birth_date),
    faculty_name: item.faculty_name || null,
    level_name: item.level_name || null,
    gov_name: item.gov_name || null,
    nationality_name: item.nationality_name || null,
    verified: Boolean(item.verified),
    is_active: Boolean(item.is_active),
  };
};

// ==========================================
// 2. Admin Single Student Resource (GET /users/:id)
// ==========================================
export const toAdminStudentResource = (student, req = null) => {
  if (!student) return null;
  const item = Array.isArray(student) ? student[0] : student;
  if (!item) return null;

  const profilePhotoUrl = formatStudentFileUrl(
    item.user_image_file || item.photo,
    item.username,
    req,
  );
  const nationalIdFileUrl = formatStudentFileUrl(
    item.national_id_file,
    item.username,
    req,
  );
  const feesFileUrl = formatStudentFileUrl(
    item.fees_file,
    item.username,
    req,
  );

  return {
    id: item.id,
    student_id: item.id,
    username: item.username,
    email: item.email,
    phone_number: item.phone_number,
    national_id: item.national_id != null ? String(item.national_id) : null,
    gender: item.gender,
    birth_date: formatDate(item.birth_date),
    verified: Boolean(item.verified),
    is_active: Boolean(item.is_active),

    // Files & full URLs for admin review
    profile_photo_url: profilePhotoUrl,
    national_id_file_url: nationalIdFileUrl,
    fees_file_url: feesFileUrl,

    // Relational lookups
    faculty_id: item.faculty_id,
    faculty_name: item.faculty_name || item.faculty || null,


    level_id: item.level_id,
    level_name: item.level_name || item.level || null,


    gov_id: item.gov_id,
    gov_name: item.gov_name || item.governorate || null,

    nationality_id: item.nationality_id,
    nationality_name: item.nationality_name || item.nationality || null,

    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

// ==========================================
// 3. Admin Students List Resource (GET /users)
// ==========================================
export const toAdminStudentsListResource = (items = [], req = null) => {
  const list = Array.isArray(items) ? items : [items];
  return list.map((student) => toAdminStudentResource(student, req));
};
