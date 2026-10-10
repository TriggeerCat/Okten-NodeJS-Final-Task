import { Request, Response } from "express";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { noticeService } from "./notice.service";
import { INotice, INoticeCreateDTO } from "./notice.interface";
import { tokenService } from "../token/token.service";
import { IParamsId, IParamsRegion } from "../api/req-res-types.interface";
import { NoticeModel } from "./notice.model";

class NoticeController {
    // GET
    public async getAll(req: Request, res: Response) {
        const notices = await noticeService.getAll();
        res.status(STATUS_CODES.ok).json(notices);
    }

    public async getOneById(req: Request<IParamsId>, res: Response) {
        const notice = await noticeService.getById(req.params.id);
        res.status(STATUS_CODES.ok).json(notice);
    }

    public async getManyByRegion(req: Request<IParamsRegion>, res: Response) {
        const notice = await noticeService.getByRegion(req.params.region);
        res.status(STATUS_CODES.ok).json(notice);
    }

    public async getPremiumViews(req: Request<IParamsId>, res: Response) {
        const { userId } = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
        const views = await noticeService.getPremiumViews(req.params.id, userId);
        res.status(STATUS_CODES.ok).json(views);
    }

    public async getPremiumAvgPrices(req: Request<IParamsRegion>, res: Response) {
        const { userId } = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
        const prices = await noticeService.getPremiumAvgPrices(req.body.model, req.body.region, userId);
        res.status(STATUS_CODES.ok).json(prices);
    }

    // CREATE
    public async createNotice(req: Request, res: Response) {
        const tokenPayload = tokenService.verifyToken(req.headers.authorization?.split(" ")[1] ?? " ", "access");
        const id = tokenPayload.userId;

        const data: INoticeCreateDTO = req.body;
        const notice = await noticeService.create(data, id);
        res.status(STATUS_CODES.ok).json(notice);
    }

    // UPDATE
    public async updateNotice(req: Request<IParamsId>, res: Response) {
        const notice: Partial<INotice> = req.body;
        const updatedNotice = await noticeService.updateById(req.params.id, notice);
        res.status(STATUS_CODES.ok).json(updatedNotice);
    }

    public async updateDescription(req: Request<IParamsId>, res: Response) {
        const updatedNotice = await noticeService.updateDescription(req.params.id, req.body.decription);
        res.status(STATUS_CODES.ok).json(updatedNotice);
    }

    // DELETE
    public async delete(req: Request<IParamsId>, res: Response) {
        await noticeService.delete(req.params.id);
        res.status(STATUS_CODES.no_content).end();
    }

    // DEBUG
    public async debugFillViews(req: Request<IParamsId>, res: Response) {
        const id = req.params.id;
        const updatedNotice = await NoticeModel.findByIdAndUpdate(
            id,
            {
                views: [
                    new Date(), // зараз
                    new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 годин тому
                    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 день тому
                    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 днів тому
                    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 днів тому
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 1 місяць тому
                ]
            },
            { returnDocument: "after" }
        );
        res.status(STATUS_CODES.ok).json(updatedNotice);
    }
}

export const noticeController = new NoticeController();
