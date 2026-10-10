import { model, Schema } from "mongoose";
import { ICarModel } from "./model.interface";

const ModelSchema = new Schema(
    {
        brandId: { type: Schema.Types.ObjectId, ref: "brand", required: true },
        model: { type: String, required: true }
    },
    {
        versionKey: false
    }
);

export const ModelModel = model<ICarModel>("model", ModelSchema);
