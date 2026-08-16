import { CAR_BRANDS, CAR_MODELS, CarBrandEnum } from "../../enums/cars.enum";
import { CURRENCIES } from "../../enums/currencies.enum";
import z from "zod";
import { createEnumSchema } from "../../utils/createEnumSchema";
import { REGIONS } from "../../enums/regions.enum";

export class NoticeValidator {
    private static readonly brand = createEnumSchema(CAR_BRANDS, "Not a valid brand");
    private static readonly model = z.string("Model must be a string");
    private static readonly description = z
        .string("Description must be a string")
        .trim()
        .min(3, "Description is too short (at least 3 symbols)")
        .max(500, "Description is too long (at most 500 symbols)");
    private static readonly region = createEnumSchema(REGIONS, "Not a valid region");
    private static readonly price = z.coerce.number("Price must be a number");
    private static readonly currency = createEnumSchema(CURRENCIES, "Not a valid currency");

    public static readonly createNotice = z
        .object({
            brand: this.brand,
            model: this.model,
            description: this.description,
            region: this.region,
            price: this.price,
            currency: this.currency
        })
        .superRefine((notice, ctx) => {
            if (!isValidCarModel(notice.brand, notice.model)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["model"],
                    message: "Not a valid model for this brand"
                });
            }
        });

    public static readonly getPremiumPrices = z.object({
        model: this.model,
        region: this.region
    });
}

const isValidCarModel = (brand: CarBrandEnum, model: string): boolean => {
    return CAR_MODELS[brand]?.includes(model);
};
