import { RegionsEnum } from "./enums/regions.enum";
import { CurrencyEnum } from "./features/currency/currency.enum";
import { IExchangeRate, IPrices } from "./features/currency/currency.interface";
import { NoticeStatusEnum } from "./enums/notice-status.enum";
import { IBase } from "../api/base.interface";
import { IPaginationQuery } from "../api/pagination";

export interface INotice extends IBase {
    _id: string;
    brand: string;
    model: string;
    region: RegionsEnum;
    description: string;
    // price and currency exactly as the seller entered them
    price: number;
    currency: CurrencyEnum;
    // price in every currency, recalculated daily with exchangeRate
    prices: IPrices;
    exchangeRate: IExchangeRate;
    viewsCount: number;
    creatorId: string;
    status: NoticeStatusEnum;
    profanityCounter: number;
}

export type INoticeCreateDTO = Pick<INotice, "brand" | "model" | "region" | "description" | "price" | "currency">;
export type INoticeUpdateDTO = Partial<Pick<INotice, "brand" | "model" | "region" | "price" | "currency">>;

export type INoticeQuery = IPaginationQuery & Partial<Pick<INotice, "brand" | "model" | "region">>;

export interface IPremiumPricesQuery {
    brand?: string;
    model: string;
    region: RegionsEnum;
}

export interface IPremiumViews {
    views: number;
    viewsDay: number;
    viewsWeek: number;
    viewsMonth: number;
}

export type INoticeModerationQuery = IPaginationQuery & { status?: NoticeStatusEnum };

export interface IAveragePrice {
    count: number;
    average: IPrices;
}

export interface IPremiumStats extends IPremiumViews {
    prices: {
        market: IAveragePrice;
        region: IAveragePrice;
    };
}

export interface IPremiumAvgPrices {
    averagePriceUSD: number;
    averagePriceUSDRegion: number;
    noticesCount: number;
    noticesCountRegion: number;
}
