import z from "zod";

export class CatalogValidator {
    private static readonly brand = z
        .string("Brand must be a string")
        .trim()
        .toLowerCase()
        .min(1, "Brand is required")
        .max(40, "Brand is too long (at most 40 symbols)")
        .regex(/^[a-z0-9-]+$/, "Brand may only contain latin letters, digits and dashes");
    private static readonly name = z
        .string("Name must be a string")
        .trim()
        .min(1, "Name is required")
        .max(40, "Name is too long (at most 40 symbols)");
    private static readonly model = z
        .string("Model must be a string")
        .trim()
        .min(1, "Model is required")
        .max(40, "Model is too long (at most 40 symbols)");

    public static readonly createBrand = z.object({
        brand: this.brand,
        name: this.name
    });

    public static readonly createModel = z.object({
        model: this.model
    });

    public static readonly reportMissing = z.object({
        brand: this.name,
        model: this.model.optional()
    });
}
