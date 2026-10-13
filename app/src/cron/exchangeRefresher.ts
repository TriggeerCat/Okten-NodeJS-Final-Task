import { CronJob } from "cron";
import { currencyService } from "../features/notice/features/currency/currency.service";
import { noticeService } from "../features/notice/notice.service";

export const refreshExchangeAndPrices = async () => {
    if (await currencyService.refillExchange()) await noticeService.recalculatePrices();
};

// every day at 00:10, PrivatBank updates the rates shortly after midnight
export const exchangeRefresher = new CronJob("0 10 0 * * *", async () => {
    try {
        await refreshExchangeAndPrices();
    } catch (e) {
        console.error("Daily price recalculation failed:", e);
    }
});
