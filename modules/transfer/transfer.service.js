import db from "../../config/db.js";
import { transaction } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";
import Transfer from "./transfer.repository.js";
import { StatusCode } from "../../utils/status-codes.js";
import ApiError from "../../utils/api-error.js";
import { sendTransferNotificationMail } from "../../services/email.service.js";

/**
 * Step 1: Counter converts a reservation into a transfer
 */
export const initiateTransfer = async ({ reservation_id, transfer_reason, notes }) => {
  if (!reservation_id) {
    throw new ApiError("معرف الكشف الطبي مطلوب", StatusCode.BAD_REQUEST);
  }

  // 1. Verify reservation exists
  const reservation = await new Base("reservations").findById(reservation_id);
  if (!reservation) {
    throw new ApiError("بيانات الكشف الطبي غير موجودة", StatusCode.NOT_FOUND);
  }

  if (reservation.status === "محول") {
    throw new ApiError("تم تحويل هذا الكشف بالفعل", StatusCode.CONFLICT);
  }

  if (reservation.status === "مرفوض") {
    throw new ApiError("لا يمكن تحويل كشف مرفوض", StatusCode.BAD_REQUEST);
  }

  // 2. Check if a transfer record already exists for this reservation
  const existingTransfer = await new Transfer().findByReservationId(reservation_id);
  if (existingTransfer) {
    throw new ApiError("يوجد طلب تحويل مسجل بالفعل لهذا الكشف", StatusCode.CONFLICT);
  }

  // 3. Update reservation status and insert transfer record inside a transaction
  const result = await transaction(async (connection) => {
    // Update reservation status to "محول"
    await connection.execute(
      `UPDATE reservations SET status = 'محول', updated_at = NOW() WHERE id = ?`,
      [reservation_id],
    );

    // Create pending transfer
    const [insertResult] = await connection.execute(
      `INSERT INTO transfers (reservation_id, hospital_id, transfer_reason, notes, status) VALUES (?, NULL, ?, ?, 'pending')`,
      [reservation_id, transfer_reason || "تحويل لمستشفى خارجية", notes || null],
    );

    return insertResult;
  });

  return {
    transfer_id: result.insertId,
    reservation_id,
    status: "pending",
  };
};

/**
 * Step 2: Transfer Clerk selects external hospital and notifies the student/patient
 */
export const assignHospital = async (transferId, { hospital_id, notes }) => {
  if (!hospital_id) {
    throw new ApiError("معرف المستشفى الخارجية مطلوب", StatusCode.BAD_REQUEST);
  }

  // 1. Verify transfer existence
  const transfer = await new Transfer().findById(transferId);
  if (!transfer) {
    throw new ApiError("بيانات طلب التحويل غير موجودة", StatusCode.NOT_FOUND);
  }

  // 2. Verify external hospital existence
  const hospital = await new Base("external_hospitals").findById(hospital_id);
  if (!hospital) {
    throw new ApiError("المستشفى الخارجية المحددة غير موجودة أو غير مفعلة", StatusCode.NOT_FOUND);
  }

  // 3. Update transfer record
  await new Transfer().assignHospital(transferId, {
    hospital_id,
    notes,
  });

  // 4. Get full transfer and recipient details for response and email notification
  const details = await new Transfer().getTransferDetails(transferId);

  // 5. Send email notification if user email exists
  if (details?.email) {
    try {
      await sendTransferNotificationMail(
        {
          email: details.email,
          username: details.username || details.patient_name,
        },
        {
          hospital_name: details.hospital_name || hospital.hospital_name,
          transfer_reason: details.transfer_reason,
          notes: details.notes,
        },
      );
    } catch (mailError) {
      console.error("Transfer notification email could not be sent:", mailError.message);
    }
  }

  return details;
};

/**
 * Get all transfers with search and optional status filter
 */
export const getTransferred = async ({ page, limit, searchKey, status }) => {
  try {
    const result = await new Transfer().index({
      page,
      limit,
      searchKey,
      status,
    });
    return result;
  } catch (error) {
    console.error("Transfer service error:", error);
    throw new ApiError("Failed to fetch transferred data", StatusCode.BAD_REQUEST);
  }
};

/**
 * Update general transfer details
 */
export const updateTransfer = async (id, data) => {
  try {
    const exist = await new Transfer().findById(id);
    if (!exist) {
      throw new ApiError("بيانات التحويل غير موجودة", StatusCode.NOT_FOUND);
    }

    if (data.hospital_id) {
      const hospital = await new Base("external_hospitals").findById(data.hospital_id);
      if (!hospital) {
        throw new ApiError("المستشفى المحددة غير موجودة", StatusCode.NOT_FOUND);
      }
    }

    const updated = await new Transfer().update(id, data);
    return updated;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Update Transfer service error:", error);
    throw new ApiError("Failed to update transfer", StatusCode.BAD_REQUEST);
  }
};

/**
 * Get single transfer details by ID
 */
export const getTransferById = async (id) => {
  const transfer = await new Transfer().getTransferDetails(id);
  if (!transfer) {
    throw new ApiError("بيانات طلب التحويل غير موجودة", StatusCode.NOT_FOUND);
  }
  return transfer;
};

