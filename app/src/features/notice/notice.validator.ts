import { CAR_BRANDS, CAR_MODELS, CarBrandEnum } from "./enums/cars.enum";
import { CURRENCY } from "./features/currency/currency.enum";
import z from "zod";
import { REGIONS } from "./enums/regions.enum";
import { profanityMatcher } from "../../utils/profanityMatcher";

export class NoticeValidator {
    private static readonly brand = z.enum(Object.values(CAR_BRANDS), "Not a valid brand");
    private static readonly model = z.enum(Object.values(CAR_MODELS).flat(), "Not a valid model");
    private static readonly region = z.enum(Object.values(REGIONS), "Not a valid region");
    private static readonly price = z.coerce.number("Price must be a number");
    private static readonly currency = z.enum(Object.values(CURRENCY), "Not a valid currency");
    private static readonly description = z
        .string("Description must be a string")
        .trim()
        .min(3, "Description is too short (at least 3 symbols)")
        .max(500, "Description is too long (at most 500 symbols)");

    public static readonly createNotice = z
        .object({
            brand: this.brand,
            model: this.model,
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

    public static readonly checkDescription = z.object({
        description: this.description
    });

    public static readonly hasProfanity = z
        .string()
        .refine((description) => profanityMatcher.hasMatch(description), "This description contains profanity");
}

const isValidCarModel = (brand: CarBrandEnum, model: string): boolean => {
    return CAR_MODELS[brand]?.includes(model);
};
