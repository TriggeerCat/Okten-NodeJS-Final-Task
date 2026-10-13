import { BrandModel } from "./brand.model";
import { ICarBrandCreateDTO } from "./brand.interface";
import { ApiError } from "../../../api/api.error";
import { STATUS_CODES } from "../../../../enums/status-codes.enum";
import { CAR_BRANDS_NAMES, CAR_MODELS, CarBrandEnum } from "../../enums/cars.enum";
import { ModelModel } from "../model/model.model";

class BrandService {
    // GET
    public getAll() {
        return BrandModel.find().sort({ name: 1 });
    }

    public getOne(brand: string) {
        return BrandModel.findOne({ brand });
    }

    public async getWithError(brand: string) {
        const carBrand = await this.getOne(brand);
        if (!carBrand) throw new ApiError("Brand not found", STATUS_CODES.not_found);
        return carBrand;
    }

    // CREATE
    public async create(dto: ICarBrandCreateDTO) {
        if (await BrandModel.exists({ brand: dto.brand }))
            throw new ApiError("This brand already exists", STATUS_CODES.conflict);
        return await BrandModel.create(dto);
    }

    // DELETE
    public async delete(brand: string) {
        return await BrandModel.findOneAndDelete({ brand });
    }

    // fills an empty catalog with the brands and models from cars.enum
    public async seedDefaults() {
        if (await BrandModel.estimatedDocumentCount()) return;

        const brands = await BrandModel.insertMany(
            Object.entries(CAR_BRANDS_NAMES).map(([brand, name]) => ({ brand, name }))
        );
        await ModelModel.insertMany(
            brands.flatMap((carBrand) =>
                CAR_MODELS[carBrand.brand as CarBrandEnum].map((model) => ({ brandId: carBrand._id, model }))
            )
        );
        console.log("Car catalog seeded");
    }
}

export const brandService = new BrandService();
