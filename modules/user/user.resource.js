/**
 * DTO / Resource transformers for User responses.
 */

/**
 * Format any file/image path into a fully qualified URL.
 */
export const formatUserFileUrl = (filePath, username = null, req = null) => {
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

export const formatStudentFileUrl = formatUserFileUrl;

const formatDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  const str = String(date).trim();
  return str.includes("T") ? str.split("T")[0] : str.slice(0, 10);
};

// ==========================================
// 1. User Self Profile Resource (GET /me, PUT /me)
// ==========================================
export const toUserProfileResource = (user, req = null) => {
  if (!user) return null;
  const item = Array.isArray(user) ? user[0] : user;
  if (!item) return null;

  const rawPhoto = item.user_image_path || item.user_image_file || item.photo || null;
  const profilePhotoUrl = formatUserFileUrl(
    rawPhoto,
    item.username,
    req,
  );

  return {
    id: item.id,
    user_id: item.id,
    student_id: item.id,
    username: item.username,
    userName: item.username,
    email: item.email,
    phone_number: item.phone_number,
    phoneNumber: item.phone_number,
    profile_photo_url: profilePhotoUrl,
    user_image_path: rawPhoto,
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

export const toStudentProfileResource = toUserProfileResource;

// ==========================================
// 2. Admin Single User Resource (GET /users/:id)
// ==========================================
export const toAdminUserResource = (user, req = null) => {
  if (!user) return null;
  const item = Array.isArray(user) ? user[0] : user;
  if (!item) return null;

  const rawPhoto = item.user_image_path || item.user_image_file || item.photo;
  const rawNationalIdFile = item.national_id_path || item.national_id_file;
  const rawFeesFile = item.fees_path || item.fees_file;

  const profilePhotoUrl = formatUserFileUrl(
    rawPhoto,
    item.username,
    req,
  );
  const nationalIdFileUrl = formatUserFileUrl(
    rawNationalIdFile,
    item.username,
    req,
  );
  const feesFileUrl = formatUserFileUrl(
    rawFeesFile,
    item.username,
    req,
  );

  return {
    id: item.id,
    user_id: item.id,
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
    user_image_path: rawPhoto,
    national_id_path: rawNationalIdFile,
    fees_path: rawFeesFile,
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

export const toAdminStudentResource = toAdminUserResource;

// ==========================================
// 3. Admin Users List Resource (GET /users)
// ==========================================
export const toAdminUsersListResource = (items = [], req = null) => {
  const list = Array.isArray(items) ? items : [items];
  return list.map((user) => toAdminUserResource(user, req));
};

export const toAdminStudentsListResource = toAdminUsersListResource;
