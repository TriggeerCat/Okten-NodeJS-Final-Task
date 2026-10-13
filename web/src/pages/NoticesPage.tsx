import { useSearchParams } from "react-router";
import { toQuery, useApi } from "../api";
import type { Notice, Paginated } from "../types";
import { REGIONS, plural, regionLabel } from "../constants";
import { BrandModelFields, useBrands } from "../components/catalog";
import { NoticeCard } from "../components/NoticeCard";
import { Alert, Card, Field, Loading, Pagination, Select } from "../components/ui";

const LIMIT = 10;

export function NoticesPage() {
    const [params, setParams] = useSearchParams();
    const brand = params.get("brand") ?? "";
    const model = params.get("model") ?? "";
    const region = params.get("region") ?? "";
    const page = Number(params.get("page") ?? 1);

    const { brandName } = useBrands();
    const { data, error, loading } = useApi<Paginated<Notice>>(
        `/notice${toQuery({ brand, model, region, page, limit: LIMIT })}`
    );

    const update = (changes: Record<string, string | number>) => {
        const next = { brand, model, region, page: 1, ...changes };
        setParams(toQuery(next));
    };

    return (
        <>
            <Card>
                <div className="grid gap-3 sm:grid-cols-3">
                    <BrandModelFields
                        brand={brand}
                        model={model}
                        anyLabel="Any"
                        onChange={(newBrand, newModel) => update({ brand: newBrand, model: newModel })}
                    />
                    <Field label="Region">
                        <Select value={region} onChange={(e) => update({ region: e.target.value })}>
                            <option value="">Any</option>
                            {REGIONS.map((item) => (
                                <option key={item} value={item}>
                                    {regionLabel(item)}
                                </option>
                            ))}
                        </Select>
                    </Field>
                </div>
            </Card>

            <Alert error={error} />
            {loading && !data ? (
                <Loading />
            ) : data && data.data.length ? (
                <>
                    <p className="text-sm text-slate-500">{plural(data.total, "car")} found</p>
                    {data.data.map((notice) => (
                        <NoticeCard key={notice._id} notice={notice} brandName={brandName} />
                    ))}
                    <Pagination page={data.page} limit={data.limit} total={data.total} onChange={(p) => update({ page: p })} />
                </>
            ) : (
                <p className="py-8 text-center text-slate-400">No cars found</p>
            )}
        </>
    );
}
