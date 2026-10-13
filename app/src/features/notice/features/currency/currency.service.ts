import { CURRENCY, CurrencyEnum } from "./currency.enum";
import { IExchangeRate, IPBCurrency, IPrices } from "./currency.interface";
import { ApiError } from "../../../api/api.error";
import { STATUS_CODES } from "../../../../enums/status-codes.enum";

const PRIVATBANK_URL = "https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=11";

class CurrencyService {
    private rate: IExchangeRate | null = null;

    public getRate() {
        if (!this.rate) throw new ApiError("Exchange rates are not available yet", STATUS_CODES.bad_gateway);
        return this.rate;
    }

    // keeps the previous rate if PrivatBank is unavailable or answers with garbage
    public async refillExchange() {
        try {
            const response = await fetch(PRIVATBANK_URL, { signal: AbortSignal.timeout(10_000) });
            if (!response.ok) throw new Error(`PrivatBank responded with ${response.status}`);
            const data: IPBCurrency[] = await response.json();

            const usd = Number(data.find((item) => item.ccy === "USD")?.sale);
            const eur = Number(data.find((item) => item.ccy === "EUR")?.sale);
            if (usd <= 0 || eur <= 0) throw new Error("PrivatBank response is missing USD or EUR");

            this.rate = { usd, eur, date: new Date() };
            return true;
        } catch (e) {
            console.error("Failed to refresh exchange rates:", e);
            return false;
        }
    }

    public toUAH(price: number, currency: CurrencyEnum, rate = this.getRate()) {
        return currency === CURRENCY.uah ? price : price * rate[currency];
    }

    public calculatePrices(price: number, currency: CurrencyEnum, rate = this.getRate()): IPrices {
        const uah = this.toUAH(price, currency, rate);
        return {
            [CURRENCY.uah]: this.round(uah),
            [CURRENCY.usd]: this.round(uah / rate.usd),
            [CURRENCY.eur]: this.round(uah / rate.eur)
        };
    }

    private round(value: number) {
        return Math.round(value * 100) / 100;
    }
}

export const currencyService = new CurrencyService();
