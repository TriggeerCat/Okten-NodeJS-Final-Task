import { Request, Response } from "express";
import { STATUS_CODES } from "../../../../enums/status-codes.enum";
import { catalogService } from "./catalog.service";
import { ILocalsToken, IParamsBrand } from "../../../api/req-res-types.interface";

class CatalogController {
    // GET
    public async getBrands(req: Request, res: Response) {
        const brands = await catalogService.getBrands();
        res.status(STATUS_CODES.ok).json(brands);
    }

    public async getModels(req: Request<IParamsBrand>, res: Response) {
        const models = await catalogService.getModels(req.params.brand.toLowerCase());
        res.status(STATUS_CODES.ok).json(models);
    }

    // CREATE
    public async createBrand(req: Request, res: Response<any, ILocalsToken>) {
        const brand = await catalogService.createBrand(req.body, res.locals.tokenPayload);
        res.status(STATUS_CODES.created).json(brand);
    }

    public async createModel(req: Request<IParamsBrand>, res: Response<any, ILocalsToken>) {
        const model = await catalogService.createModel(
            req.params.brand.toLowerCase(),
            req.body.model,
            res.locals.tokenPayload
        );
        res.status(STATUS_CODES.created).json(model);
    }

    // REPORT
    public async reportMissing(req: Request, res: Response<any, ILocalsToken>) {
        await catalogService.reportMissing(req.body.brand, req.body.model, res.locals.tokenPayload);
        res.status(STATUS_CODES.no_content).end();
    }
}

export const catalogController = new CatalogController();
