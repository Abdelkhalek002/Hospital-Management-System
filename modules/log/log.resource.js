/**
 * Transform log records into API resources.
 */
export const toLogResource = (log) => {
  if (!log) return null;
  const item = Array.isArray(log) ? log[0] : log;
  if (!item) return null;

  let parsedDetails = null;
  if (item.details) {
    try {
      parsedDetails =
        typeof item.details === "string"
          ? JSON.parse(item.details)
          : item.details;
    } catch {
      parsedDetails = item.details;
    }
  }

  return {
    id: item.id,
    adminId: item.admin_id,
    adminName: item.admin_name || item.username || null,
    action: item.action || null,
    entityType: item.entity_type || null,
    entityId: item.entity_id || null,
    details: parsedDetails,
    ipAddress: item.ip_address || null,
    userAgent: item.user_agent || null,
    status: item.status || "SUCCESS",
    method: item.method,
    createdAt: item.created_at,
  };
};

export const toLogListResource = (items = []) => {
  const list = Array.isArray(items) ? items : [items];
  return list.map((log) => toLogResource(log));
};

// Aliases for backward compatibility
export const toAdminLogResource = toLogResource;
export const toAdminLogListResource = toLogListResource;
