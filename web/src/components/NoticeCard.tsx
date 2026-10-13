import { Link } from "react-router";
import type { Notice } from "../types";
import { formatPrice, plural, regionLabel } from "../constants";
import { Prices, StatusBadge } from "./ui";

export function NoticeCard({
    notice,
    brandName,
    showStatus,
    actions
}: {
    notice: Notice;
    brandName: (slug: string) => string;
    showStatus?: boolean;
    actions?: React.ReactNode;
}) {
    return (
        <article className="flex flex-wrap items-start gap-4 rounded-lg bg-white p-4 shadow-sm">
            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <Link to={`/notices/${notice._id}`} className="text-lg font-semibold text-blue-700 hover:underline">
                        {brandName(notice.brand)} {notice.model}
                    </Link>
                    {showStatus && <StatusBadge status={notice.status} />}
                </div>
                <p className="text-sm text-slate-500">
                    {regionLabel(notice.region)} · {plural(notice.viewsCount, "view")}
                </p>
                <p className="line-clamp-2 text-sm">{notice.description}</p>
                {actions && <div className="flex flex-wrap gap-2 pt-2">{actions}</div>}
            </div>
            <div className="text-right">
                <p className="text-xl font-bold">{formatPrice(notice.price, notice.currency)}</p>
                <Prices prices={notice.prices} original={notice.currency} />
            </div>
        </article>
    );
}
