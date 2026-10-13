import { model, Schema } from "mongoose";
import { ICarModel } from "./model.interface";

const ModelSchema = new Schema(
    {
        brandId: { type: Schema.Types.ObjectId, ref: "brand", required: true },
        model: { type: String, required: true, trim: true }
    },
    {
        versionKey: false
    }
);

ModelSchema.index({ brandId: 1, model: 1 }, { unique: true });

export const ModelModel = model<ICarModel>("model", ModelSchema);
