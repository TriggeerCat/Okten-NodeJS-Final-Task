import { CarBrandEnum, CarModelEnum } from "../../enums/cars.enum";
import { RegionsEnum } from "../../enums/regions.enum";
import { CurrenciesEnum } from "../../enums/currencies.enum";

export interface INotice {
    _id: string;
    brand: CarBrandEnum;
    model: CarModelEnum;
    region: RegionsEnum;
    description: string;
    price: number;
    currency: CurrenciesEnum;
    views: Date[];
    creatorId: string;
}

export type INoticeCreateDTO = Pick<INotice, "brand" | "description" | "price" | "currency">;

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

//* кількість переглядів оголошення
// 	* кількість переглядів за день, тиждень, місяць
// 	* Середню ціну на авто по регіону продажу авто.
// Наприклад якщо авто продається у Києві, то буде середня ціна авто по Києву.
// Якщо у Львівській області, то середня ціна буде по Львівській області
// 	* середня ціна авто по цілій Україні
