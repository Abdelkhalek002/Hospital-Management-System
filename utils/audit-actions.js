/**
 * Standardized Action Constants and Human-Readable Labels for Audit Logging.
 */

export const AuditAction = Object.freeze({
  // Reservations
  RESERVATION_ACCEPT: "RESERVATION.ACCEPT",
  RESERVATION_REJECT: "RESERVATION.REJECT",
  RESERVATION_TRANSFER: "RESERVATION.TRANSFER",
  RESERVATION_EMERGENCY_CREATE: "RESERVATION.EMERGENCY_CREATE",
  RESERVATION_EMERGENCY_UPDATE: "RESERVATION.EMERGENCY_UPDATE",
  RESERVATION_EMERGENCY_DELETE: "RESERVATION.EMERGENCY_DELETE",

  // External Transfers
  TRANSFER_INITIATE: "TRANSFER.INITIATE",
  TRANSFER_ASSIGN_HOSPITAL: "TRANSFER.ASSIGN_HOSPITAL",
  TRANSFER_UPDATE: "TRANSFER.UPDATE",

  // Admins
  ADMIN_CREATE: "ADMIN.CREATE",
  ADMIN_UPDATE: "ADMIN.UPDATE",
  ADMIN_DELETE: "ADMIN.DELETE",

  // Authentication
  AUTH_ADMIN_LOGIN: "AUTH.ADMIN_LOGIN",
  AUTH_PASSWORD_RESET: "AUTH.PASSWORD_RESET",

  // System Data
  SYSTEM_DATA_CREATE: "SYSTEM_DATA.CREATE",
  SYSTEM_DATA_UPDATE: "SYSTEM_DATA.UPDATE",
  SYSTEM_DATA_DELETE: "SYSTEM_DATA.DELETE",

  // Users / Students
  USER_UPDATE_STATUS: "USER.UPDATE_STATUS",
  USER_DELETE: "USER.DELETE",
});

export const AuditActionLabels = Object.freeze({
  [AuditAction.RESERVATION_ACCEPT]: "قبول طلب كشف",
  [AuditAction.RESERVATION_REJECT]: "رفض طلب كشف",
  [AuditAction.RESERVATION_TRANSFER]: "تحويل كشف طبي إلى قسم التحويلات الخارجية",
  [AuditAction.RESERVATION_EMERGENCY_CREATE]: "حجز كشف عاجل",
  [AuditAction.RESERVATION_EMERGENCY_UPDATE]: "تعديل حجز كشف عاجل",
  [AuditAction.RESERVATION_EMERGENCY_DELETE]: "حذف حجز كشف عاجل",

  [AuditAction.TRANSFER_INITIATE]: "تحويل كشف طبي إلى قسم التحويلات الخارجية",
  [AuditAction.TRANSFER_ASSIGN_HOSPITAL]: "تحديد مستشفى خارجية وإرسال تفاصيل التحويل",
  [AuditAction.TRANSFER_UPDATE]: "تحديث طلب تحويل لمستشفي خارجية",

  [AuditAction.ADMIN_CREATE]: "اضافة ادمن جديد",
  [AuditAction.ADMIN_UPDATE]: "تعديل بيانات أدمن",
  [AuditAction.ADMIN_DELETE]: "حذف ادمن",

  [AuditAction.AUTH_ADMIN_LOGIN]: "تسجيل دخول أدمن",
  [AuditAction.AUTH_PASSWORD_RESET]: "إعادة تعيين كلمة المرور",

  [AuditAction.SYSTEM_DATA_CREATE]: "إضافة بيانات أساسية بالنظام",
  [AuditAction.SYSTEM_DATA_UPDATE]: "تعديل بيانات أساسية بالنظام",
  [AuditAction.SYSTEM_DATA_DELETE]: "حذف بيانات أساسية بالنظام",

  [AuditAction.USER_UPDATE_STATUS]: "تعديل حالة حساب طالب",
  [AuditAction.USER_DELETE]: "حذف حساب طالب",
});
