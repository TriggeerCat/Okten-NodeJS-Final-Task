import { CURRENCY } from "./currency.enum";
import { IPBCurrency } from "./currency.interface";

class CurrencyService {
    public exchange = {
        [CURRENCY.uah]: 1,
        [CURRENCY.usd]: 1,
        [CURRENCY.eur]: 1
    };

    public refillExchange = async () => {
        const response = await fetch("https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=11");
        const data: IPBCurrency[] = await response.json();

        this.exchange[CURRENCY.usd] = Number(data.find((item) => item.ccy === "USD")?.sale);
        this.exchange[CURRENCY.eur] = Number(data.find((item) => item.ccy === "EUR")?.sale);
    };
}

export const currencyService = new CurrencyService();
