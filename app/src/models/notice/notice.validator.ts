import { CAR_BRANDS } from "../../enums/cars.enum";
import { CURRENCIES } from "../../enums/currencies.enum";
import z from "zod";
import { createEnumSchema } from "../../utils/createEnumSchema";

export class NoticeValidator {
    private static readonly brand = createEnumSchema(CAR_BRANDS, "Not a valid brand");
    private static readonly description = z
        .string("Description must be a string")
        .min(3, "Description is too short")
        .max(500, "Description is too long");
    private static readonly price = z.number("Price must be a number");
    private static readonly currency = createEnumSchema(CURRENCIES, "Not a valid currency");

    public static readonly createNotice = z.object({
        brand: this.brand,
        description: this.description,
        price: this.price,
        currency: this.currency
    });
}
