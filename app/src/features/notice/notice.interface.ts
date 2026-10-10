import { CarBrandEnum, CarModelEnum } from "./enums/cars.enum";
import { RegionsEnum } from "./enums/regions.enum";
import { CurrencyEnum } from "./features/currency/currency.enum";

export interface INotice {
    _id: string;
    brand: CarBrandEnum;
    model: CarModelEnum;
    region: RegionsEnum;
    description: string;
    price: number;
    currency: CurrencyEnum;
    views: Date[];
    creatorId: string;
    isDescriptionValid: boolean;
    profanityCounter: number;
}

export type INoticeCreateDTO = Pick<INotice, "brand" | "price" | "currency">;

export interface IPremiumViews {
    views: number;
    viewsDay: number;
    viewsWeek: number;
    viewsMonth: number;
}

export interface IPremiumAvgPrices {
    averagePriceUSD: number;
    averagePriceUSDRegion: number;
}
