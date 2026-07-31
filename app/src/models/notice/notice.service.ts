import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { NoticeModel } from "./notice.model";
import { INotice, INoticeCreateDTO } from "./notice.interface";

class NoticeService {
    public getAll() {
        return NoticeModel.find();
    }

    public async getById(id: string) {
        const notice = await NoticeModel.findById(id);
        if (!notice) throw new ApiError("Notice not found", STATUS_CODES.not_found);
        return notice;
    }

    public create(notice: INoticeCreateDTO, _creatorId: string) {
        return NoticeModel.create({
            _creatorId,
            ...notice
        });
    }

    public async updateById(id: string, newNotice: Partial<INotice>) {
        const notice = await NoticeModel.findByIdAndUpdate(id, newNotice, { returnDocument: "after" });
        if (!notice) throw new ApiError("Notice not found", STATUS_CODES.not_found);
        return notice;
    }

    public async delete(id: string) {
        const notice = await NoticeModel.findById(id);
        if (!notice) throw new ApiError("Notice not found", STATUS_CODES.not_found);
        await NoticeModel.findByIdAndDelete(id, { returnDocument: "after" });
    }
}

export const noticeService = new NoticeService();
