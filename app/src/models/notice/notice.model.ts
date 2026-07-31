import { model, Schema } from "mongoose";
import { CAR_BRANDS } from "../../enums/cars.enum";
import { CURRENCIES } from "../../enums/currencies.enum";
import { INotice } from "./notice.interface";

const NoticeSchema = new Schema(
    {
        brand: { enum: Object.values(CAR_BRANDS), type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { enum: Object.values(CURRENCIES), type: String, required: true },
        views: { type: [Date], default: [] },
        _creatorId: { type: String, required: true }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const NoticeModel = model<INotice>("notice", NoticeSchema);
