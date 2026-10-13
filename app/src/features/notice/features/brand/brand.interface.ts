export interface ICarBrand {
    _id: string;
    // slug, e.g. "mercedes-benz"
    brand: string;
    // display name, e.g. "Mercedes Benz"
    name: string;
}

export type ICarBrandCreateDTO = Pick<ICarBrand, "brand" | "name">;
