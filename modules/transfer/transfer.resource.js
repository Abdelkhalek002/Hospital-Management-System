/**
 * DTO / Resource transformers for Transfer responses.
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

/**
 * Transform a single transfer record into an API resource (Get by ID or single object).
 */
export const toTransferResource = (transfer, req = null) => {
  if (!transfer) return null;
  const item = Array.isArray(transfer) ? transfer[0] : transfer;
  if (!item) return null;

  const rawImage = item.user_image_path || item.user_image_file || item.userImage;
  const userImgUrl = formatImageUrl(rawImage, req);

  const userId = item.user_id ?? item.student_id ?? null;
  const patientName =
    item.user_name ?? item.student_name ?? item.patient_name ?? item.username ?? null;
  const nationalId =
    item.patient_national_id != null
      ? String(item.patient_national_id)
      : item.national_id != null
        ? String(item.national_id)
        : null;
  const phoneNumber =
    item.patient_phone_number || item.user_phone || item.phone_number || null;
  const email = item.user_email ?? item.student_email ?? item.email ?? null;

  const hospitalId = item.hospital_id || null;
  const hospitalName = item.hospital_name || item.transfered_to || null;

  return {
    id: item.id,
    transferId: item.transfer_id ?? item.id,
    status: item.transfer_status ?? item.status,
    createdAt: item.transfer_created_at ?? item.created_at,
    externalHospital:
      hospitalId
        ? {
          id: hospitalId,
          name: hospitalName,
        }
        : null,
    reservation: {
      id: item.reservation_id ?? item.id,
      examType: item.exam_type ?? null,
      status: item.reservation_status ?? null,
      date: item.reservation_date ?? item.date ?? null,
      clinicName: item.clinic_name ?? null,
    },
    patient: {
      id: userId,
      name: patientName,
      email,
      phoneNumber,
    },
  };
};

/**
 * Transform a list of transfer records into API resources.
 */
export const toTransfersListResource = (transfers = [], req = null) => {
  if (!Array.isArray(transfers)) return [];
  return transfers.map((item) => toTransferResource(item, req));
};

export default {
  toTransferResource,
  toTransfersListResource,
};
