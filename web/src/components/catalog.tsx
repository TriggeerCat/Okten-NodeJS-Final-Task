import { useApi } from "../api";
import type { Brand, CarModel } from "../types";
import { Field, Select } from "./ui";

export function useBrands() {
    const { data } = useApi<Brand[]>("/notice/catalog/brands");
    const brands = data ?? [];
    const brandName = (slug: string) => brands.find((brand) => brand.brand === slug)?.name ?? slug;
    return { brands, brandName };
}

// brand dropdown + model dropdown of the selected brand
export function BrandModelFields({
    brand,
    model,
    onChange,
    anyLabel
}: {
    brand: string;
    model: string;
    onChange: (brand: string, model: string) => void;
    // when set, an empty "any" option is offered (used by filters)
    anyLabel?: string;
}) {
    const { brands } = useBrands();
    const { data: models } = useApi<CarModel[]>(brand ? `/notice/catalog/brands/${brand}/models` : null);

    return (
        <>
            <Field label="Brand">
                <Select value={brand} onChange={(e) => onChange(e.target.value, "")} required={!anyLabel}>
                    <option value="">{anyLabel ?? "Choose a brand"}</option>
                    {brands.map((item) => (
                        <option key={item._id} value={item.brand}>
                            {item.name}
                        </option>
                    ))}
                </Select>
            </Field>
            <Field label="Model">
                <Select
                    value={model}
                    onChange={(e) => onChange(brand, e.target.value)}
                    disabled={!brand}
                    required={!anyLabel}
                >
                    <option value="">{anyLabel ?? "Choose a model"}</option>
                    {brand &&
                        models?.map((item) => (
                            <option key={item._id} value={item.model}>
                                {item.model}
                            </option>
                        ))}
                </Select>
            </Field>
        </>
    );
}
