import { ModelModel } from "./model.model";

class ModelService {
    // GET
    public getAll() {
        return ModelModel.find();
    }

    public getOne(model: string) {
        return ModelModel.findOne({ model });
    }

    // CREATE
    public create(model: string, brandId: string) {
        return ModelModel.create({ model, brandId });
    }

    // DELETE
    public async delete(model: string) {
        return await ModelModel.findOneAndDelete({ model }, { returnDocument: "after" });
    }
}

export const modelService = new ModelService();
