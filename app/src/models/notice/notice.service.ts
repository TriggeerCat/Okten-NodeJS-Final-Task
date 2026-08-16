import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { NoticeModel } from "./notice.model";
import { INotice, INoticeCreateDTO, IPremiumAvgPrices, IPremiumViews } from "./notice.interface";
import { englishDataset, englishRecommendedTransformers, RegExpMatcher } from "obscenity";
import { RegionsEnum } from "../../enums/regions.enum";
import { CURRENCIES, CURRENCIES_RELATION, CurrenciesEnum } from "../../enums/currencies.enum";
import { CarModelEnum } from "../../enums/cars.enum";
import { userService } from "../user/user.service";

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

        let day = 0,
            week = 0,
            month = 0;

        for (const view of views) {
            const today = new Date();

            if (today.getMonth() === view.getMonth() && today.getFullYear() === view.getFullYear()) {
                month++;

                const startOfWeek = new Date(today);
                const dayOfTheWeek = today.getDay() ? today.getDay() - 1 : 6;
                startOfWeek.setDate(today.getDate() - dayOfTheWeek);
                startOfWeek.setHours(0, 0, 0, 0);

                if (view >= startOfWeek) {
                    week++;
                    if (today.getDate() === view.getDate()) {
                        day++;
                    }
                }
            }
        }

        const data: IPremiumViews = {
            views: views.length,
            viewsDay: day,
            viewsWeek: week,
            viewsMonth: month
        };

        return data;
    }

    public async getPremiumAvgPrices(model: CarModelEnum, region: RegionsEnum, userId: string) {
        await this.validateUserPremiumStatus(userId);

        const notices = await NoticeModel.find({ model });

        let fullCount = notices.length,
            fullPrice = 0,
            regionCount = 0,
            regionPrice = 0;

        for (const notice of notices) {
            fullPrice += this.convertPrice(notice.price, notice.currency, CURRENCIES.usd);

            if (notice.region === region) {
                regionPrice += this.convertPrice(notice.price, notice.currency, CURRENCIES.usd);
                regionCount++;
            }
        }

        const data: IPremiumAvgPrices = {
            averagePriceUSD: fullCount ? fullPrice / fullCount : 0,
            averagePriceUSDRegion: regionCount ? regionPrice / regionCount : 0
        };

        return data;
    }

    // CREATE
    public create(notice: INoticeCreateDTO, creatorId: string) {
        this.validateProfanity(notice.description);

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

    private validateProfanity(description: string) {
        const matcher = new RegExpMatcher({
            ...englishDataset.build(),
            ...englishRecommendedTransformers
        });

        if (matcher.hasMatch(description))
            throw new ApiError("This description contains profanity", STATUS_CODES.forbidden);
    }

    private convertPrice(price: number, fromCurrency: CurrenciesEnum, toCurrency: CurrenciesEnum) {
        return price * (CURRENCIES_RELATION[fromCurrency] / CURRENCIES_RELATION[toCurrency]);
    }

    private async validateUserPremiumStatus(userId: string) {
        const { isPremium } = await userService.getById(userId);
        if (!isPremium) throw new ApiError("This user does not have a premium status", STATUS_CODES.forbidden);
    }
}

export const noticeService = new NoticeService();
