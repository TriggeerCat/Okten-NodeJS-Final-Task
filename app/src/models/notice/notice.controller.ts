import { Request, Response } from "express";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { noticeService } from "./notice.service";
import { INotice, INoticeCreateDTO } from "./notice.interface";
import { tokenService } from "../token/token.service";
import { IParamsId } from "../api/req-res-types.interface";

class NoticeController {
    public async getAll(req: Request, res: Response) {
        const notices = await noticeService.getAll();
        res.status(STATUS_CODES.ok).json(notices);
    }

    public async getOne(req: Request<IParamsId>, res: Response) {
        const notice = await noticeService.getById(req.params.id);
        res.status(STATUS_CODES.ok).json(notice ?? { status: "Notice not found" });
    }

    public async createNotice(req: Request, res: Response) {
        const tokenPayload = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
        const id = tokenPayload.userId;

        const data: INoticeCreateDTO = req.body;
        const notice = await noticeService.create(data, id);
        res.status(STATUS_CODES.ok).json(notice);
    }

    public async updateNotice(req: Request<IParamsId>, res: Response) {
        const notice: Partial<INotice> = req.body;
        const updatedNotice = await noticeService.updateById(req.params.id, notice);
        res.status(STATUS_CODES.ok).json(updatedNotice);
    }

    public async delete(req: Request<IParamsId>, res: Response) {
        await noticeService.delete(req.params.id);
        res.status(STATUS_CODES.no_content).end();
    }
}

export const noticeController = new NoticeController();
