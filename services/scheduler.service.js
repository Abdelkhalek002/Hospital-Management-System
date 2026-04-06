import { CronJob } from "cron";
import AuthRepo from "../modules/auth/auth.repository.js";
import db from "../config/db.js";

export const deActivateUser = async (email) => {
  new CronJob(
    "0 0 1 1 *",
    async () => {
      try {
        await new AuthRepo().deActivateEmail("students", email);
        console.log(
          `Account Deactivated⏳...Rows updated: ${result.affectedRows}`,
        );
      } catch (error) {
        console.error("Error updating verified:", error);
      }
    },
    null,
    false,
    "Africa/Cairo",
  ).start();
};
