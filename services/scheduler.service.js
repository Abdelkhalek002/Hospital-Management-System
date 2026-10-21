import { CronJob } from "cron";
import { purgeOldLogs } from "../modules/log/log.service.js";

export const scheduleAuditLogCleanup = () => {
  const cronTime = process.env.AUDIT_LOG_CLEANUP_CRON || "0 2 * * *"; // Default: 02:00 AM every night
  const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS, 10) || 90;

  const job = new CronJob(
    cronTime,
    async () => {
      try {
        console.log(`⏱️ [AuditLog Cron] Checking and purging logs older than ${retentionDays} days...`);
        const deletedCount = await purgeOldLogs(retentionDays);
        if (deletedCount > 0) {
          console.log(`⏱️ [AuditLog Cron] Purged ${deletedCount} expired log record(s).`);
        } else {
          console.log(`⏱️ [AuditLog Cron] No expired logs found.`);
        }
      } catch (error) {
        console.error("❌ [AuditLog Cron] Error cleaning up old logs:", error?.message || error);
      }
    },
    null,
    true,
    "Africa/Cairo",
  );

  console.log(`⏱️ Audit log cleanup cron initialized (${cronTime}, retention: ${retentionDays} days)`);
  return job;
};
