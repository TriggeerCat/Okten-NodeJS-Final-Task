import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { NoticeModel } from "./notice.model";
import { INotice, INoticeCreateDTO, IPremiumAvgPrices, IPremiumViews } from "./notice.interface";
import { RegionsEnum } from "./enums/regions.enum";
import { CURRENCY, CurrencyEnum } from "./features/currency/currency.enum";
import { CarModelEnum } from "./enums/cars.enum";
import { userService } from "../user/user.service";
import { NoticeValidator } from "./notice.validator";
import { currencyService } from "./features/currency/currency.service";

class NoticeService {
    // GET
    public getAll() {
        return NoticeModel.find();
    }

    public async getById(id: string) {
        const notice = await this.getWithError(id);
        notice.views.unshift(new Date());
        return await NoticeModel.findByIdAndUpdate(id, { views: notice.views }, { returnDocument: "after" });
    }

    public async getByRegion(region: RegionsEnum) {
        return await NoticeModel.find({ region });
    }

    public async getPremiumViews(id: string, userId: string) {
        await this.validateUserPremiumStatus(userId);

        const { views } = await this.getWithError(id);

        const stats: IPremiumViews = {
            views: views.length,
            viewsDay: 0,
            viewsWeek: 0,
            viewsMonth: 0
        };

        views.forEach((view) => {
            const today = new Date();

            if (today.getMonth() === view.getMonth() && today.getFullYear() === view.getFullYear()) {
                stats.viewsMonth++;

                const startOfWeek = new Date(today);
                const dayOfTheWeek = today.getDay() ? today.getDay() - 1 : 6;
                startOfWeek.setDate(today.getDate() - dayOfTheWeek);
                startOfWeek.setHours(0, 0, 0, 0);

                if (view >= startOfWeek) {
                    stats.viewsWeek++;
                    if (today.getDate() === view.getDate()) {
                        stats.viewsDay++;
                    }
                }
            }
        });

        return stats;
    }

    public async getPremiumAvgPrices(model: CarModelEnum, region: RegionsEnum, userId: string) {
        await this.validateUserPremiumStatus(userId);

        const notices = await NoticeModel.find({ model });
        const regionNotices = notices.filter((notice) => notice.region === region);

        const fullPrice = notices.reduce(
            (acc, notice) => acc + this.convertPrice(notice.price, notice.currency, CURRENCY.usd),
            0
        );
        const regionPrice = regionNotices.reduce(
            (acc, notice) => acc + this.convertPrice(notice.price, notice.currency, CURRENCY.usd),
            0
        );

        const stats: IPremiumAvgPrices = {
            averagePriceUSD: notices.length ? fullPrice / notices.length : 0,
            averagePriceUSDRegion: regionNotices.length ? regionPrice / regionNotices.length : 0
        };

        return stats;
    }

    // CREATE
    public create(notice: INoticeCreateDTO, creatorId: string) {
        return NoticeModel.create({
            creatorId,
            ...notice
        });
    }

    // UPDATE
    public async updateById(id: string, newNotice: Partial<INotice>) {
        await this.getWithError(id);
        return await NoticeModel.findByIdAndUpdate(id, newNotice, { returnDocument: "after" });
    }

    public async updateDescription(id: string, description: string) {
        const notice = await this.getWithError(id);

        if (notice.profanityCounter > 2) throw new ApiError("Too many profanity attempts", STATUS_CODES.forbidden);

        const result = NoticeValidator.hasProfanity.safeParse(description);

        if (!result.success) {
            const updatedNotice = await NoticeModel.findByIdAndUpdate(
                id,
                { profanityCounter: notice.profanityCounter++ },
                { returnDocument: "after" }
            );

            if (!updatedNotice) throw new ApiError("Notice was deleted :3", STATUS_CODES.not_found);

            // if (updatedNotice.profanityCounter === 3) send letter to manager

            throw new ApiError(
                `Your description contains profanity, attempts left: ${3 - updatedNotice.profanityCounter}`,
                STATUS_CODES.bad_request
            );
        }

        return await NoticeModel.findByIdAndUpdate(
            id,
            { isDescriptionValid: true, profanityCounter: 0 },
            { returnDocument: "after" }
        );
    }

    // DELETE
    public async delete(id: string) {
        await this.getWithError(id);
        return await NoticeModel.findByIdAndDelete(id);
    }

    // UTILS
    private async getWithError(id: string) {
        const notice = await NoticeModel.findById(id);
        if (!notice) throw new ApiError("Notice not found", STATUS_CODES.not_found);
        return notice;
    }

    private convertPrice(price: number, fromCurrency: CurrencyEnum, toCurrency: CurrencyEnum) {
        return price * (currencyService.exchange[fromCurrency] / currencyService.exchange[toCurrency]);
    }

    private async validateUserPremiumStatus(userId: string) {
        const { isPremium } = await userService.getById(userId);
        if (!isPremium) throw new ApiError("This user does not have a premium status", STATUS_CODES.forbidden);
    }
}

export const noticeService = new NoticeService();
