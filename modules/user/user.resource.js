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
    profile_photo_url: profilePhotoUrl,
    national_id_file_url: nationalIdFileUrl,
    fees_file_url: feesFileUrl,
    national_id: item.national_id != null ? String(item.national_id) : null,
    gender: item.gender,
    birth_date: formatDate(item.birth_date),
    faculty_name: item.faculty_name || null,
    level_name: item.level_name || null,
    gov_name: item.gov_name || null,
    nationality_name: item.nationality_name || null,
    verified: Boolean(item.verified),
    is_active: Boolean(item.is_active),
    document_status: item.document_status || "pending",
    rejection_reason: item.rejection_reason || null,
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
    document_status: item.document_status || "pending",
    rejection_reason: item.rejection_reason || null,
    reviewed_by: item.reviewed_by || null,
    reviewed_at: item.reviewed_at || null,

    // Files & full URLs for admin review
    profile_photo_url: profilePhotoUrl,
    national_id_file_url: nationalIdFileUrl,
    fees_file_url: feesFileUrl,

    // Relational lookups
    faculty_id: item.faculty_id,
    faculty_name: item.faculty_name || item.faculty || null,

    level_id: item.level_id || null,
    level_name: item.level_name || item.level || null,

    level_id: item.level_id || null,
    level_name: item.level_name || item.level || null,

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
// 3. Admin User List Item Resource (GET /users)
// ==========================================
export const toAdminUserListItemResource = (
  user,
  req = null,
  fields = null,
) => {
  if (!user) return null;
  const item = Array.isArray(user) ? user[0] : user;
  if (!item) return null;

  const rawPhoto = item.user_image_path || item.user_image_file || item.photo;
  const profilePhotoUrl = formatUserFileUrl(
    rawPhoto,
    item.username,
    req,
  );

  const data = {
    id: item.id,
    user_id: item.id,
    student_id: item.id,
    username: item.username,
    email: item.email,
    profile_photo_url: profilePhotoUrl,

    // Relational display names & IDs
    faculty_id: item.faculty_id,
    faculty_name: item.faculty_name || item.faculty || null,

    level_id: item.level_id || null,
    level_name: item.level_name || item.level || null,

    is_active: Boolean(item.is_active),
    document_status: item.document_status,

    created_at: item.created_at,
  };

  const selectedFields =
    Array.isArray(fields) && fields.length > 0
      ? fields
      : typeof fields === "string" && fields.trim()
        ? fields.split(",").map((f) => f.trim()).filter(Boolean)
        : typeof req?.query?.fields === "string" && req.query.fields.trim()
          ? req.query.fields.split(",").map((f) => f.trim()).filter(Boolean)
          : null;

  if (selectedFields && selectedFields.length > 0) {
    const filtered = {};
    for (const field of selectedFields) {
      if (field in data) {
        filtered[field] = data[field];
      }
    }
    return filtered;
  }

  return data;
};

export const toAdminStudentListItemResource = toAdminUserListItemResource;

// ==========================================
// 4. Admin Users List Resource (GET /users)
// ==========================================
export const toAdminUsersListResource = (
  items = [],
  req = null,
  fields = null,
) => {
  const list = Array.isArray(items) ? items : [items];
  return list.map((user) => toAdminUserListItemResource(user, req, fields));
};

export const toAdminStudentsListResource = toAdminUsersListResource;

