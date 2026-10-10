import { model, Schema } from "mongoose";
import { CAR_BRANDS } from "./enums/cars.enum";
import { CURRENCY } from "./features/currency/currency.enum";
import { INotice } from "./notice.interface";
import { REGIONS } from "./enums/regions.enum";

const NoticeSchema = new Schema(
    {
        brand: { enum: Object.values(CAR_BRANDS), type: String, required: true },
        model: { type: String, required: true },
        description: { type: String, required: true },
        region: { enum: Object.values(REGIONS), type: String, required: true },
        price: { type: Number, required: true },
        currency: { enum: Object.values(CURRENCY), type: String, required: true },
        views: { type: [Date], default: [] },
        creatorId: { type: String, required: true },
        isDescriptionValid: { type: Boolean, default: false },
        profanityCounter: { type: Number, default: 0 }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const NoticeModel = model<INotice>("notice", NoticeSchema);
