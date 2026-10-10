import { CronJob } from "cron";
import { tokenService } from "../features/token/token.service";

export const tokenCleaner = new CronJob("0 0 0 * * *", async () => {
    await tokenService.deleteExpiredTokens();
});
