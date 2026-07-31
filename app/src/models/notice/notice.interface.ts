import { CurrenciesEnum } from "../../enums/currencies.enum";
import { CarBrandEnum } from "../../enums/cars.enum";

export interface INotice {
    _id: string;
    brand: CarBrandEnum;
    description: string;
    price: number;
    currency: CurrenciesEnum;
    views: Date[];
    _creatorId: string;
}

export type INoticeCreateDTO = Pick<INotice, "brand" | "description" | "price" | "currency">;
