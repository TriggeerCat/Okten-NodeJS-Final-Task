import { model, Schema } from "mongoose";

export interface INoticeView {
    _id: string;
    noticeId: string;
    createdAt: Date;
}

// One document per view. Kept outside the notice so notices don't grow with every read.
const NoticeViewSchema = new Schema(
    {
        noticeId: { type: Schema.Types.ObjectId, ref: "notice", required: true },
        // stats only go back one calendar month, older views are removed by MongoDB
        createdAt: { type: Date, default: Date.now, expires: 32 * 24 * 60 * 60 }
    },
    { versionKey: false }
);

NoticeViewSchema.index({ noticeId: 1, createdAt: -1 });

export const NoticeViewModel = model<INoticeView>("notice_view", NoticeViewSchema);
