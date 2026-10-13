import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { NoticeModel } from "./notice.model";
import {
    INotice,
    INoticeCreateDTO,
    INoticeQuery,
    INoticeUpdateDTO,
    IAveragePrice,
    INoticeModerationQuery,
    IPremiumAvgPrices,
    IPremiumPricesQuery,
    IPremiumStats,
    IPremiumViews
} from "./notice.interface";
import { IPrices } from "./features/currency/currency.interface";
import { RegionsEnum } from "./enums/regions.enum";
import { CURRENCY } from "./features/currency/currency.enum";
import { userService } from "../user/user.service";
import { NoticeValidator } from "./notice.validator";
import { currencyService } from "./features/currency/currency.service";
import { ITokenPayload } from "../token/token.interface";
import { assertRolePermission } from "../../utils/hasRolePermission";
import { PERMS_NOTICE, PermissionsEnum } from "../../enums/permissions.enum";
import { MAX_DESCRIPTION_ATTEMPTS, NOTICE_STATUS } from "./enums/notice-status.enum";
import { NoticeViewModel } from "./features/view/view.model";
import { catalogService } from "./features/catalog/catalog.service";
import { IPaginated, IPaginationQuery, toSkip } from "../api/pagination";
import { emailService } from "../email/email.service";
import { EMAIL_TEMPLATE } from "../email/enums/email.enum";

class NoticeService {
    // GET
    public async getAll(query: INoticeQuery): Promise<IPaginated<INotice>> {
        const { page, limit, ...filters } = query;
        const filter = { ...filters, status: NOTICE_STATUS.active };
        const [data, total] = await Promise.all([
            NoticeModel.find(filter).sort({ createdAt: -1 }).skip(toSkip({ page, limit })).limit(limit),
            NoticeModel.countDocuments(filter)
        ]);
        return { data, total, page, limit };
    }

    public getByRegion(region: RegionsEnum, pagination: IPaginationQuery) {
        return this.getAll({ ...pagination, region });
    }

    public async getMy(actor: ITokenPayload, pagination: IPaginationQuery): Promise<IPaginated<INotice>> {
        const filter = { creatorId: actor.userId };
        const [data, total] = await Promise.all([
            NoticeModel.find(filter).sort({ createdAt: -1 }).skip(toSkip(pagination)).limit(pagination.limit),
            NoticeModel.countDocuments(filter)
        ]);
        return { data, total, ...pagination };
    }

    // public view of an active notice, every call counts as a view
    // includes seller contacts, so buyers can arrange a viewing or a test drive
    public async getById(id: string) {
        const notice = await NoticeModel.findOneAndUpdate(
            { _id: id, status: NOTICE_STATUS.active },
            { $inc: { viewsCount: 1 } },
            { returnDocument: "after" }
        );
        if (!notice) throw new ApiError("Notice not found", STATUS_CODES.not_found);
        const [seller] = await Promise.all([
            userService.getById(notice.creatorId).catch(() => null),
            NoticeViewModel.create({ noticeId: id })
        ]);
        return {
            ...notice.toJSON(),
            seller: seller && { _id: seller._id, name: seller.name, email: seller.email, dealership: seller.tenant }
        };
    }

    // any status, for the owner and for staff, doesn't count as a view
    public async getManaged(id: string, actor: ITokenPayload) {
        const notice = await this.getWithError(id);
        await this.assertCanManage(notice, actor, PERMS_NOTICE.update);
        return notice;
    }

    // notices that failed the profanity check, for managers to review
    public async getModeration(query: INoticeModerationQuery, actor: ITokenPayload): Promise<IPaginated<INotice>> {
        assertRolePermission(actor.role, PERMS_NOTICE.update);
        const { page, limit, status } = query;
        const filter: Record<string, unknown> = {
            status: status ?? { $in: [NOTICE_STATUS.inactive, NOTICE_STATUS.pending] }
        };
        // tenant staff only moderates notices of its own tenant
        if (actor.tenant) filter.creatorId = { $in: await userService.getIdsByTenant(actor.tenant) };

        const [data, total] = await Promise.all([
            NoticeModel.find(filter).sort({ updatedAt: -1 }).skip(toSkip({ page, limit })).limit(limit),
            NoticeModel.countDocuments(filter)
        ]);
        return { data, total, page, limit };
    }

    // everything a premium seller gets for a notice: views and average prices for the same car
    public async getPremiumStats(id: string, actor: ITokenPayload): Promise<IPremiumStats> {
        const views = await this.getPremiumViews(id, actor);
        const notice = await this.getWithError(id);
        const prices = await this.getAveragePrices(notice.brand, notice.model, notice.region);
        return { ...views, prices };
    }

    public async getPremiumViews(id: string, actor: ITokenPayload): Promise<IPremiumViews> {
        await this.validateUserPremiumStatus(actor.userId);
        const notice = await this.getWithError(id);
        if (notice.creatorId !== actor.userId)
            throw new ApiError("You can only see statistics of your own notices", STATUS_CODES.forbidden);

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // week starts on monday
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - ((startOfDay.getDay() + 6) % 7));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const countSince = (date: Date) => NoticeViewModel.countDocuments({ noticeId: id, createdAt: { $gte: date } });
        const [viewsDay, viewsWeek, viewsMonth] = await Promise.all([
            countSince(startOfDay),
            countSince(startOfWeek),
            countSince(startOfMonth)
        ]);

        return { views: notice.viewsCount, viewsDay, viewsWeek, viewsMonth };
    }

    public async getPremiumAvgPrices(query: IPremiumPricesQuery, actor: ITokenPayload): Promise<IPremiumAvgPrices> {
        await this.validateUserPremiumStatus(actor.userId);

        const { brand, model, region } = query;
        const { market, region: inRegion } = await this.getAveragePrices(brand, model, region);

        return {
            averagePriceUSD: market.average[CURRENCY.usd],
            averagePriceUSDRegion: inRegion.average[CURRENCY.usd],
            noticesCount: market.count,
            noticesCountRegion: inRegion.count
        };
    }

    private async getAveragePrices(brand: string | undefined, model: string, region: RegionsEnum) {
        const group = {
            $group: {
                _id: null,
                [CURRENCY.uah]: { $avg: `$prices.${CURRENCY.uah}` },
                [CURRENCY.usd]: { $avg: `$prices.${CURRENCY.usd}` },
                [CURRENCY.eur]: { $avg: `$prices.${CURRENCY.eur}` },
                count: { $sum: 1 }
            }
        };
        type IGroup = IPrices & { count: number };
        const [stats] = await NoticeModel.aggregate<{ market: IGroup[]; region: IGroup[] }>([
            { $match: { status: NOTICE_STATUS.active, model, ...(brand ? { brand } : {}) } },
            { $facet: { market: [group], region: [{ $match: { region } }, group] } }
        ]);

        const toAverage = (result?: IGroup): IAveragePrice => ({
            count: result?.count ?? 0,
            average: {
                [CURRENCY.uah]: Math.round((result?.[CURRENCY.uah] ?? 0) * 100) / 100,
                [CURRENCY.usd]: Math.round((result?.[CURRENCY.usd] ?? 0) * 100) / 100,
                [CURRENCY.eur]: Math.round((result?.[CURRENCY.eur] ?? 0) * 100) / 100
            }
        });

        return { market: toAverage(stats?.market[0]), region: toAverage(stats?.region[0]) };
    }

    // CREATE
    public async create(dto: INoticeCreateDTO, actor: ITokenPayload) {
        assertRolePermission(actor.role, PERMS_NOTICE.create);
        await catalogService.assertValidPair(dto.brand, dto.model);

        const user = await userService.getById(actor.userId);
        if (!user.isPremium && (await NoticeModel.exists({ creatorId: actor.userId })))
            throw new ApiError("Basic accounts can only have one notice, get premium for more", STATUS_CODES.forbidden);

        const exchangeRate = currencyService.getRate();
        const isClean = !NoticeValidator.hasProfanity(dto.description);

        return await NoticeModel.create({
            ...dto,
            prices: currencyService.calculatePrices(dto.price, dto.currency, exchangeRate),
            exchangeRate,
            creatorId: actor.userId,
            status: isClean ? NOTICE_STATUS.active : NOTICE_STATUS.pending
        });
    }

    // UPDATE
    public async updateById(id: string, dto: INoticeUpdateDTO, actor: ITokenPayload) {
        const notice = await this.getWithError(id);
        await this.assertCanManage(notice, actor, PERMS_NOTICE.update);

        if (dto.model) await catalogService.assertValidPair(dto.brand ?? notice.brand, dto.model);

        const update: Partial<INotice> = { ...dto };
        if (dto.price !== undefined || dto.currency !== undefined) {
            const exchangeRate = currencyService.getRate();
            update.exchangeRate = exchangeRate;
            update.prices = currencyService.calculatePrices(
                dto.price ?? notice.price,
                dto.currency ?? notice.currency,
                exchangeRate
            );
        }

        return await NoticeModel.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true });
    }

    public async updateDescription(id: string, description: string, actor: ITokenPayload) {
        const notice = await this.getWithError(id);
        await this.assertCanManage(notice, actor, PERMS_NOTICE.update);

        if (notice.status === NOTICE_STATUS.inactive)
            throw new ApiError("Too many profanity attempts, the notice waits for a manager", STATUS_CODES.forbidden);

        if (!NoticeValidator.hasProfanity(description)) {
            return await NoticeModel.findByIdAndUpdate(
                id,
                { description, status: NOTICE_STATUS.active, profanityCounter: 0 },
                { returnDocument: "after" }
            );
        }

        // the description is still saved so a manager can review it
        const updatedNotice = await NoticeModel.findByIdAndUpdate(
            id,
            { description, status: NOTICE_STATUS.pending, $inc: { profanityCounter: 1 } },
            { returnDocument: "after" }
        );
        if (!updatedNotice) throw new ApiError("Notice not found", STATUS_CODES.not_found);

        if (updatedNotice.profanityCounter >= MAX_DESCRIPTION_ATTEMPTS) {
            await NoticeModel.updateOne({ _id: id }, { status: NOTICE_STATUS.inactive });
            await this.notifyManagers(updatedNotice);
            throw new ApiError(
                "Your description contains profanity, the notice is deactivated and sent to a manager",
                STATUS_CODES.bad_request
            );
        }

        throw new ApiError(
            `Your description contains profanity, attempts left: ${MAX_DESCRIPTION_ATTEMPTS - updatedNotice.profanityCounter}`,
            STATUS_CODES.bad_request
        );
    }

    // managers approve notices after reviewing them
    public async activate(id: string, actor: ITokenPayload) {
        const notice = await this.getWithError(id);
        await this.assertCanModerate(notice, actor, PERMS_NOTICE.update);
        return await NoticeModel.findByIdAndUpdate(
            id,
            { status: NOTICE_STATUS.active, profanityCounter: 0 },
            { returnDocument: "after" }
        );
    }

    // DELETE
    public async delete(id: string, actor: ITokenPayload) {
        const notice = await this.getWithError(id);
        await this.assertCanManage(notice, actor, PERMS_NOTICE.delete);
        await Promise.all([NoticeModel.findByIdAndDelete(id), NoticeViewModel.deleteMany({ noticeId: id })]);
    }

    // DAILY
    public async recalculatePrices() {
        const { usd, eur, date } = currencyService.getRate();
        const rateOfCurrency = {
            $switch: {
                branches: [
                    { case: { $eq: ["$currency", CURRENCY.usd] }, then: usd },
                    { case: { $eq: ["$currency", CURRENCY.eur] }, then: eur }
                ],
                default: 1
            }
        };
        const priceUAH = { $multiply: ["$price", rateOfCurrency] };

        await NoticeModel.updateMany(
            {},
            [
                {
                    $set: {
                        prices: {
                            [CURRENCY.uah]: { $round: [priceUAH, 2] },
                            [CURRENCY.usd]: { $round: [{ $divide: [priceUAH, usd] }, 2] },
                            [CURRENCY.eur]: { $round: [{ $divide: [priceUAH, eur] }, 2] }
                        },
                        exchangeRate: { usd, eur, date }
                    }
                }
            ],
            { updatePipeline: true }
        );
    }

    // converts notices saved before statuses and the views collection existed
    public async migrateLegacyNotices() {
        await NoticeModel.updateMany(
            { status: { $exists: false } },
            [
                {
                    $set: {
                        status: { $cond: ["$isDescriptionValid", NOTICE_STATUS.active, NOTICE_STATUS.pending] },
                        viewsCount: { $size: { $ifNull: ["$views", []] } }
                    }
                },
                { $unset: ["isDescriptionValid", "views"] }
            ],
            { updatePipeline: true }
        );
    }

    // UTILS
    private async getWithError(id: string) {
        const notice = await NoticeModel.findById(id);
        if (!notice) throw new ApiError("Notice not found", STATUS_CODES.not_found);
        return notice;
    }

    // owners can always manage their notices, staff needs the permission
    private async assertCanManage(notice: INotice, actor: ITokenPayload, permission: PermissionsEnum) {
        if (notice.creatorId === actor.userId) return;
        await this.assertCanModerate(notice, actor, permission);
    }

    private async assertCanModerate(notice: INotice, actor: ITokenPayload, permission: PermissionsEnum) {
        const owner = await userService.getById(notice.creatorId).catch(() => null);
        if (!userService.canModerate(actor, permission, owner))
            throw new ApiError("You can't manage this notice", STATUS_CODES.forbidden);
    }

    private async notifyManagers(notice: INotice) {
        const [creator, emails] = await Promise.all([
            userService.getById(notice.creatorId),
            userService.getPlatformStaffEmails()
        ]);
        emailService.sendEmailInBackground(emails, EMAIL_TEMPLATE.warning, {
            noticeId: notice._id,
            userName: creator.name,
            userEmail: creator.email
        });
    }

    private async validateUserPremiumStatus(userId: string) {
        const { isPremium } = await userService.getById(userId);
        if (!isPremium) throw new ApiError("This user does not have a premium status", STATUS_CODES.forbidden);
    }
}

export const noticeService = new NoticeService();
