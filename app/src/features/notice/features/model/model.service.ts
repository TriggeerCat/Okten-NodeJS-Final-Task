import { ModelModel } from "./model.model";
import { ApiError } from "../../../api/api.error";
import { STATUS_CODES } from "../../../../enums/status-codes.enum";

class ModelService {
    // GET
    public getAllByBrand(brandId: string) {
        return ModelModel.find({ brandId }).sort({ model: 1 });
    }

    public getOne(brandId: string, model: string) {
        return ModelModel.findOne({ brandId, model });
    }

    // CREATE
    public async create(brandId: string, model: string) {
        if (await ModelModel.exists({ brandId, model }))
            throw new ApiError("This model already exists", STATUS_CODES.conflict);
        return await ModelModel.create({ brandId, model });
    }

    // DELETE
    public async delete(brandId: string, model: string) {
        return await ModelModel.findOneAndDelete({ brandId, model });
    }
}

export const modelService = new ModelService();
