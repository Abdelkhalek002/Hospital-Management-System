import { CronJob } from "cron";
import db from "../config/db.js";
import User from "../repositories/user.repository.js";
import { UserType } from "../utils/user-types.js";

export const deActivateUser = async (email) => {
  new CronJob(
    "0 0 1 1 *",
    async () => {
      try {
        const user = await new User(UserType.STUDENT);
        user.deActivateEmail(email);
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
