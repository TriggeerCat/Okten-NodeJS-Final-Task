import { BrandModel } from "./brand.model";

class BrandService {
    // GET
    public getAll() {
        return BrandModel.find();
    }

    public getOne(brand: string) {
        return BrandModel.findOne({ brand });
    }

    // CREATE
    public create(brand: string) {
        return BrandModel.create({ brand });
    }

    // DELETE
    public async delete(brand: string) {
        return await BrandModel.findOneAndDelete({ brand }, { returnDocument: "after" });
    }
}

export const brandService = new BrandService();
