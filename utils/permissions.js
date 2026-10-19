import { roles } from "./roles.js";

export const permissions = Object.freeze({
  // Admins & System Management
  ADMINS_READ: "admins:read",
  ADMINS_CREATE: "admins:create",
  ADMINS_UPDATE: "admins:update",
  ADMINS_DELETE: "admins:delete",
  STATS_READ: "stats:read",
  LOGS_READ: "logs:read",
  LOGS_DELETE: "logs:delete",

  // Users (Students/Patients) Management
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",

  // Reservations
  RESERVATIONS_READ: "reservations:read",
  RESERVATIONS_WRITE: "reservations:write",
  RESERVATIONS_APPROVE: "reservations:approve",
  RESERVATIONS_DELETE: "reservations:delete",

  // Transfers
  TRANSFERS_READ: "transfers:read",
  TRANSFERS_WRITE: "transfers:write",
});

export const rolePermissions = Object.freeze({
  [roles.SUPER_ADMIN]: ["*"],

  [roles.MEDICAL_TESTS_MANAGER]: [
    // permissions.ADMINS_READ,
    // permissions.STATS_READ,
    // permissions.LOGS_READ,
    // permissions.USERS_READ,
    // permissions.USERS_WRITE,
    // permissions.RESERVATIONS_READ,
    // permissions.RESERVATIONS_WRITE,
    // permissions.RESERVATIONS_APPROVE,
    // permissions.TRANSFERS_READ,
    // permissions.TRANSFERS_WRITE,
  ],

  [roles.MEDICAL_CHECK_MANAGER]: [
    // permissions.USERS_READ,
    // permissions.RESERVATIONS_READ,
    // permissions.RESERVATIONS_WRITE,
    // permissions.RESERVATIONS_APPROVE,
    // permissions.STATS_READ,
  ],

  [roles.COUNTER]: [
    permissions.USERS_READ,
    permissions.RESERVATIONS_READ,
    permissions.RESERVATIONS_WRITE,
    permissions.TRANSFERS_WRITE,
  ],

  [roles.TRANSFER_CLERK]: [
    permissions.USERS_READ,
    permissions.TRANSFERS_READ,
    permissions.TRANSFERS_WRITE,
  ],

  [roles.OBSERVER]: [
    // permissions.ADMINS_READ,
    // permissions.STATS_READ,
    // permissions.LOGS_READ,
    // permissions.USERS_READ,
    // permissions.RESERVATIONS_READ,
    // permissions.TRANSFERS_READ,
  ],
});

export default permissions;
