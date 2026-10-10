import { model, Schema } from "mongoose";
import { ICarBrand } from "./brand.interface";

const BrandSchema = new Schema(
    {
        brand: { type: String, unique: true, required: true }
    },
    {
        versionKey: false
    }
);

export const BrandModel = model<ICarBrand>("brand", BrandSchema);
