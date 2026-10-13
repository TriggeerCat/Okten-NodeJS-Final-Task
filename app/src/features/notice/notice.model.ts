import { model, Schema } from "mongoose";
import { CURRENCY } from "./features/currency/currency.enum";
import { INotice } from "./notice.interface";
import { REGIONS } from "./enums/regions.enum";
import { NOTICE_STATUS } from "./enums/notice-status.enum";

const NoticeSchema = new Schema(
    {
        brand: { type: String, required: true },
        model: { type: String, required: true },
        description: { type: String, required: true },
        region: { enum: Object.values(REGIONS), type: String, required: true },
        price: { type: Number, required: true },
        currency: { enum: Object.values(CURRENCY), type: String, required: true },
        prices: {
            uah: { type: Number, required: true },
            usd: { type: Number, required: true },
            eur: { type: Number, required: true }
        },
        exchangeRate: {
            usd: { type: Number, required: true },
            eur: { type: Number, required: true },
            date: { type: Date, required: true }
        },
        viewsCount: { type: Number, default: 0 },
        creatorId: { type: String, required: true, index: true },
        status: { enum: Object.values(NOTICE_STATUS), type: String, default: NOTICE_STATUS.pending },
        profanityCounter: { type: Number, default: 0 }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

NoticeSchema.index({ status: 1, createdAt: -1 });
NoticeSchema.index({ status: 1, region: 1, createdAt: -1 });
NoticeSchema.index({ status: 1, brand: 1, model: 1, region: 1 });

export const NoticeModel = model<INotice>("notice", NoticeSchema);
