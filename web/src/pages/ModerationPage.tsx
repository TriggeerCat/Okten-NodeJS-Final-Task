import { useState } from "react";
import { api, toQuery, useAction, useApi } from "../api";
import type { Notice, Paginated } from "../types";
import { useBrands } from "../components/catalog";
import { NoticeCard } from "../components/NoticeCard";
import { Alert, Button, Field, Loading, Pagination, Select } from "../components/ui";

export function ModerationPage() {
    const [status, setStatus] = useState("inactive");
    const [page, setPage] = useState(1);
    const { brandName } = useBrands();
    const action = useAction();
    const { data, error, loading, reload } = useApi<Paginated<Notice>>(
        `/notice/moderation${toQuery({ status, page, limit: 10 })}`
    );

    const act = (notice: Notice, kind: "approve" | "delete") =>
        action
            .run(
                () =>
                    kind === "approve"
                        ? api(`/notice/${notice._id}/activate`, { method: "PATCH" })
                        : api(`/notice/${notice._id}`, { method: "DELETE" }),
                kind === "approve" ? "Notice approved" : "Notice deleted"
            )
            .then(reload);

    return (
        <>
            <div className="flex items-end justify-between gap-4">
                <h1 className="text-2xl font-bold">Moderation</h1>
                <div className="w-56">
                    <Field label="Show">
                        <Select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="inactive">Deactivated (needs review)</option>
                            <option value="pending">Pending (seller still editing)</option>
                            <option value="">All flagged</option>
                        </Select>
                    </Field>
                </div>
            </div>
            <Alert error={error ?? action.error} success={action.success} />
            {loading && !data ? (
                <Loading />
            ) : data && data.data.length ? (
                <>
                    {data.data.map((notice) => (
                        <NoticeCard
                            key={notice._id}
                            notice={notice}
                            brandName={brandName}
                            showStatus
                            actions={
                                <>
                                    <Button disabled={action.pending} onClick={() => act(notice, "approve")}>
                                        Approve
                                    </Button>
                                    <Button
                                        variant="danger"
                                        disabled={action.pending}
                                        onClick={() => confirm("Delete this notice?") && act(notice, "delete")}
                                    >
                                        Delete
                                    </Button>
                                </>
                            }
                        />
                    ))}
                    <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
                </>
            ) : (
                <p className="py-8 text-center text-slate-400">Nothing to review</p>
            )}
        </>
    );
}
