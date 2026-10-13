import { useState } from "react";
import { Link } from "react-router";
import { toQuery, useApi } from "../api";
import type { Notice, Paginated } from "../types";
import { useBrands } from "../components/catalog";
import { NoticeCard } from "../components/NoticeCard";
import { Alert, Loading, Pagination } from "../components/ui";

export function MyNoticesPage() {
    const [page, setPage] = useState(1);
    const { brandName } = useBrands();
    const { data, error, loading } = useApi<Paginated<Notice>>(`/notice/my${toQuery({ page, limit: 10 })}`);

    return (
        <>
            <h1 className="text-2xl font-bold">My notices</h1>
            <Alert error={error} />
            {loading && !data ? (
                <Loading />
            ) : data && data.data.length ? (
                <>
                    {data.data.map((notice) => (
                        <NoticeCard key={notice._id} notice={notice} brandName={brandName} showStatus />
                    ))}
                    <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
                </>
            ) : (
                <p className="py-8 text-center text-slate-400">
                    You have no notices yet.{" "}
                    <Link to="/notices/new" className="text-blue-700 hover:underline">
                        Sell a car
                    </Link>
                </p>
            )}
        </>
    );
}
