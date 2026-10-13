import { Request, Response } from "express";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { noticeService } from "./notice.service";
import {
    INoticeCreateDTO,
    INoticeModerationQuery,
    INoticeQuery,
    INoticeUpdateDTO,
    IPremiumPricesQuery
} from "./notice.interface";
import { ILocalsQuery, ILocalsToken, ILocalsTokenQuery, IParamsId } from "../api/req-res-types.interface";
import { IPaginationQuery } from "../api/pagination";
import { RegionsEnum } from "./enums/regions.enum";

class NoticeController {
    // GET
    public async getAll(req: Request, res: Response<any, ILocalsQuery<INoticeQuery>>) {
        const notices = await noticeService.getAll(res.locals.validQuery);
        res.status(STATUS_CODES.ok).json(notices);
    }

    public async getMy(req: Request, res: Response<any, ILocalsTokenQuery<IPaginationQuery>>) {
        const notices = await noticeService.getMy(res.locals.tokenPayload, res.locals.validQuery);
        res.status(STATUS_CODES.ok).json(notices);
    }

    public async getOneById(req: Request<IParamsId>, res: Response) {
        const notice = await noticeService.getById(req.params.id);
        res.status(STATUS_CODES.ok).json(notice);
    }

    public async getManyByRegion(
        req: Request<{ region: RegionsEnum }>,
        res: Response<any, ILocalsQuery<IPaginationQuery>>
    ) {
        const notices = await noticeService.getByRegion(req.params.region, res.locals.validQuery);
        res.status(STATUS_CODES.ok).json(notices);
    }

    public async getManaged(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const notice = await noticeService.getManaged(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(notice);
    }

    public async getModeration(req: Request, res: Response<any, ILocalsTokenQuery<INoticeModerationQuery>>) {
        const notices = await noticeService.getModeration(res.locals.validQuery, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(notices);
    }

    public async getPremiumStats(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const stats = await noticeService.getPremiumStats(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(stats);
    }

    public async getPremiumViews(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const views = await noticeService.getPremiumViews(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(views);
    }

    public async getPremiumAvgPrices(req: Request, res: Response<any, ILocalsTokenQuery<IPremiumPricesQuery>>) {
        const prices = await noticeService.getPremiumAvgPrices(res.locals.validQuery, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(prices);
    }

    // CREATE
    public async createNotice(req: Request, res: Response<any, ILocalsToken>) {
        const data: INoticeCreateDTO = req.body;
        const notice = await noticeService.create(data, res.locals.tokenPayload);
        res.status(STATUS_CODES.created).json(notice);
    }

    // UPDATE
    public async updateNotice(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const notice: INoticeUpdateDTO = req.body;
        const updatedNotice = await noticeService.updateById(req.params.id, notice, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(updatedNotice);
    }

    public async updateDescription(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const updatedNotice = await noticeService.updateDescription(
            req.params.id,
            req.body.description,
            res.locals.tokenPayload
        );
        res.status(STATUS_CODES.ok).json(updatedNotice);
    }

    public async activate(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        const notice = await noticeService.activate(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.ok).json(notice);
    }

    // DELETE
    public async delete(req: Request<IParamsId>, res: Response<any, ILocalsToken>) {
        await noticeService.delete(req.params.id, res.locals.tokenPayload);
        res.status(STATUS_CODES.no_content).end();
    }
}

export const noticeController = new NoticeController();
