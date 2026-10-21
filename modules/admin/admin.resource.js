import { rolePermissions } from "../../utils/permissions.js";

/**
 * DTO / Resource transformers for Admin responses.
 */

/**
 * Format any admin photo path into a fully qualified URL.
 */
export const formatAdminPhotoUrl = (filePath, req = null) => {
  if (!filePath) return null;
  const str = String(filePath).trim();
  if (!str) return null;

  if (str.startsWith("http://") || str.startsWith("https://")) {
    return encodeURI(str);
  }

  let cleanPath = str.replace(/\\/g, "/").replace(/^\/+/, "");

  if (cleanPath.startsWith("api/v1/uploads/admins/")) {
    cleanPath = cleanPath.replace(/^api\/v1\/uploads\/admins\//, "");
  } else if (cleanPath.startsWith("uploads/admins/")) {
    cleanPath = cleanPath.replace(/^uploads\/admins\//, "");
  } else if (cleanPath.startsWith("admins/")) {
    cleanPath = cleanPath.replace(/^admins\//, "");
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

  return `${base}/api/v1/uploads/admins/${encodedPath}`;
};

/**
 * Transform a single admin record into an API resource.
 */
export const toAdminResource = (admin, req = null) => {
  if (!admin) return null;
  const item = Array.isArray(admin) ? admin[0] : admin;
  if (!item) return null;

  const rawPhoto = item.profile_photo_path || item.profile_photo || null;
  const photoUrl = formatAdminPhotoUrl(rawPhoto, req);
  const status = item.status || (item.is_active ? "active" : "inactive");

  return {
    id: item.id,
    username: item.username,
    email: item.email,
    role: item.role,
    status,
    profile_photo_url: photoUrl,
    permissions: item.permissions?.length ? item.permissions : (rolePermissions[item.role] || []),
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

/**
 * Transform a list of admin records into API resources.
 */
export const toAdminListResource = (items = [], req = null) => {
  const list = Array.isArray(items) ? items : [items];
  return list.map((admin) => toAdminResource(admin, req));
};


