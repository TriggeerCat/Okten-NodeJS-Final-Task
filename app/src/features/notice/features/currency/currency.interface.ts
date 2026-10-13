import { CurrencyEnum } from "./currency.enum";

export interface IPBCurrency {
    ccy: string;
    base_ccy: string;
    buy: string;
    sale: string;
}

// UAH per one unit of the currency, PrivatBank sale rate
export interface IExchangeRate {
    usd: number;
    eur: number;
    date: Date;
}

export type IPrices = Record<CurrencyEnum, number>;
