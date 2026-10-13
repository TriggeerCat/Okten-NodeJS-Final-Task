import { CURRENCY } from "./features/currency/currency.enum";
import z from "zod";
import { REGIONS } from "./enums/regions.enum";
import { hasProfanity } from "../../utils/profanityMatcher";
import { paginationQuery } from "../api/pagination";
import { NOTICE_STATUS } from "./enums/notice-status.enum";

export class NoticeValidator {
    // brand/model existence is checked against the catalog collections in the service
    private static readonly brand = z.string("Brand must be a string").trim().toLowerCase().min(1).max(40);
    private static readonly model = z.string("Model must be a string").trim().min(1).max(40);
    public static readonly region = z.enum(Object.values(REGIONS), "Not a valid region");
    private static readonly price = z.coerce
        .number("Price must be a number")
        .positive("Price must be positive")
        .max(1_000_000_000, "Price is too big");
    private static readonly currency = z.enum(Object.values(CURRENCY), "Not a valid currency");
    private static readonly description = z
        .string("Description must be a string")
        .trim()
        .min(3, "Description is too short (at least 3 symbols)")
        .max(500, "Description is too long (at most 500 symbols)");

    public static readonly createNotice = z.object({
        brand: this.brand,
        model: this.model,
        region: this.region,
        description: this.description,
        price: this.price,
        currency: this.currency
    });

    // description has its own endpoint because it goes through the profanity check
    public static readonly updateNotice = z
        .object({
            brand: this.brand,
            model: this.model,
            region: this.region,
            price: this.price,
            currency: this.currency
        })
        .partial()
        .refine((notice) => Object.keys(notice).length > 0, "Nothing to update")
        .refine((notice) => !notice.brand || notice.model, {
            message: "Model is required when changing the brand",
            path: ["model"]
        });

    public static readonly getNotices = paginationQuery.extend({
        brand: this.brand.optional(),
        model: this.model.optional(),
        region: this.region.optional()
    });

    public static readonly getModeration = paginationQuery.extend({
        status: z.enum([NOTICE_STATUS.pending, NOTICE_STATUS.inactive], "Not a valid status").optional()
    });

    public static readonly getPremiumPrices = z.object({
        brand: this.brand.optional(),
        model: this.model,
        region: this.region
    });

    public static readonly checkDescription = z.object({
        description: this.description
    });

    public static readonly regionParams = z.object({
        region: this.region
    });

    public static hasProfanity(text: string) {
        return hasProfanity(text);
    }
}
