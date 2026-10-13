import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, useAction, useApi } from "../api";
import { useAuth } from "../auth";
import type { Currency, Notice, PremiumStats } from "../types";
import {
    CURRENCIES,
    MAX_DESCRIPTION_ATTEMPTS,
    REGIONS,
    formatDate,
    formatPrice,
    isStaff,
    plural,
    regionLabel
} from "../constants";
import { BrandModelFields, useBrands } from "../components/catalog";
import { Alert, Button, Card, Field, Input, Loading, Select, StatusBadge, TextArea } from "../components/ui";

export function NoticePage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const { brandName } = useBrands();
    const [notice, setNotice] = useState<Notice | null>(null);
    const [error, setError] = useState<string | null>(null);

    // owners and staff load through /manage (any status, no view counted), everyone else sees the public notice
    const load = useCallback(async () => {
        if (user) {
            try {
                setNotice(await api<Notice>(`/notice/manage/${id}`));
                return;
            } catch {
                // not the owner or staff, fall back to the public notice
            }
        }
        try {
            setNotice(await api<Notice>(`/notice/id/${id}`));
        } catch (e) {
            setError((e as Error).message);
        }
        // only the user's identity matters here, not every change of the user object
    }, [id, user?._id]);

    useEffect(() => {
        if (!authLoading) load();
    }, [authLoading, load]);

    if (error) return <Alert error={error} />;
    if (!notice) return <Loading />;

    const isOwner = user?._id === notice.creatorId;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
                <Card>
                    <div className="mb-2 flex items-center gap-2">
                        <h1 className="text-2xl font-bold">
                            {brandName(notice.brand)} {notice.model}
                        </h1>
                        {notice.status !== "active" && <StatusBadge status={notice.status} />}
                    </div>
                    <p className="mb-4 text-sm text-slate-500">
                        {regionLabel(notice.region)} · posted {formatDate(notice.createdAt)} · {plural(notice.viewsCount, "view")}
                    </p>
                    <p className="whitespace-pre-line">{notice.description}</p>
                </Card>

                {isOwner && <OwnerPanel notice={notice} onChange={setNotice} reload={load} />}
                {!isOwner && isStaff(user) && notice.status !== "active" && <StaffPanel notice={notice} onChange={setNotice} />}
            </div>

            <div className="space-y-4">
                <PriceCard notice={notice} />
                {notice.seller && (
                    <Card title="Seller">
                        <p className="font-medium">{notice.seller.name}</p>
                        {notice.seller.dealership && (
                            <p className="text-sm text-slate-500">Dealership: {notice.seller.dealership}</p>
                        )}
                        <a href={`mailto:${notice.seller.email}`} className="text-sm text-blue-700 hover:underline">
                            {notice.seller.email}
                        </a>
                        <p className="mt-2 text-xs text-slate-400">Contact the seller to arrange a viewing or a test drive.</p>
                    </Card>
                )}
                {isOwner && <StatsCard notice={notice} />}
                {!isOwner && isStaff(user) && notice.status === "active" && <StaffPanel notice={notice} onChange={setNotice} />}
            </div>
        </div>
    );
}

function PriceCard({ notice }: { notice: Notice }) {
    return (
        <Card title="Price">
            <p className="text-3xl font-bold">{formatPrice(notice.price, notice.currency)}</p>
            <p className="mb-3 text-xs text-slate-400">as set by the seller</p>
            <ul className="space-y-1 text-sm">
                {CURRENCIES.filter((currency) => currency !== notice.currency).map((currency) => (
                    <li key={currency}>≈ {formatPrice(notice.prices[currency], currency)}</li>
                ))}
            </ul>
            <p className="mt-3 text-xs text-slate-400">
                PrivatBank rate: 1 USD = {notice.exchangeRate.usd} UAH, 1 EUR = {notice.exchangeRate.eur} UAH, updated{" "}
                {formatDate(notice.exchangeRate.date)}
            </p>
        </Card>
    );
}

function OwnerPanel({
    notice,
    onChange,
    reload
}: {
    notice: Notice;
    onChange: (notice: Notice) => void;
    reload: () => Promise<void>;
}) {
    const navigate = useNavigate();
    const description = useAction();
    const details = useAction();
    const removal = useAction();
    const [text, setText] = useState(notice.description);
    const [form, setForm] = useState({
        brand: notice.brand,
        model: notice.model,
        region: notice.region,
        price: String(notice.price),
        currency: notice.currency
    });
    const attemptsLeft = MAX_DESCRIPTION_ATTEMPTS - notice.profanityCounter;

    return (
        <>
            {notice.status === "pending" && (
                <Alert
                    error={`The description failed the profanity check, so the notice is hidden. Edit it to publish. Attempts left: ${attemptsLeft}.`}
                />
            )}
            {notice.status === "inactive" && (
                <Alert error="The description failed the profanity check too many times. The notice is deactivated and waits for a manager." />
            )}

            {notice.status !== "inactive" && (
                <Card title="Edit description">
                    <form
                        className="space-y-3"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const updated = await description.run(
                                () => api<Notice>(`/notice/${notice._id}`, { method: "PATCH", body: { description: text } }),
                                "Description saved, the notice is active"
                            );
                            if (updated) onChange(updated);
                            // a rejected description still changes the attempts counter
                            else await reload();
                        }}
                    >
                        <TextArea value={text} onChange={(e) => setText(e.target.value)} minLength={3} maxLength={500} />
                        <Alert error={description.error} success={description.success} />
                        <Button disabled={description.pending}>Save description</Button>
                    </form>
                </Card>
            )}

            <Card title="Edit details">
                <form
                    className="grid gap-3 sm:grid-cols-2"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const updated = await details.run(
                            () =>
                                api<Notice>(`/notice/${notice._id}`, {
                                    method: "PUT",
                                    body: { ...form, price: Number(form.price) }
                                }),
                            "Saved"
                        );
                        if (updated) onChange(updated);
                    }}
                >
                    <BrandModelFields
                        brand={form.brand}
                        model={form.model}
                        onChange={(brand, model) => setForm({ ...form, brand, model })}
                    />
                    <Field label="Region">
                        <Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                            {REGIONS.map((region) => (
                                <option key={region} value={region}>
                                    {regionLabel(region)}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Price">
                            <Input
                                type="number"
                                min={1}
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                            />
                        </Field>
                        <Field label="Currency">
                            <Select
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
                            >
                                {CURRENCIES.map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency.toUpperCase()}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Alert error={details.error} success={details.success} />
                        <div className="flex gap-2">
                            <Button disabled={details.pending}>Save details</Button>
                            <Button
                                type="button"
                                variant="danger"
                                disabled={removal.pending}
                                onClick={async () => {
                                    if (!confirm("Delete this notice?")) return;
                                    const ok = await removal.run(() =>
                                        api(`/notice/${notice._id}`, { method: "DELETE" }).then(() => true)
                                    );
                                    if (ok) navigate("/my");
                                }}
                            >
                                Delete notice
                            </Button>
                        </div>
                        <Alert error={removal.error} />
                    </div>
                </form>
            </Card>
        </>
    );
}

function StatsCard({ notice }: { notice: Notice }) {
    const { user } = useAuth();
    const { data, error } = useApi<PremiumStats>(user?.isPremium ? `/notice/premium/stats/${notice._id}` : null);

    if (!user?.isPremium)
        return (
            <Card title="Statistics">
                <p className="mb-2 text-sm text-slate-500">
                    Views and average market prices are available for premium accounts.
                </p>
                <Link to="/premium" className="text-sm text-blue-700 hover:underline">
                    Get premium
                </Link>
            </Card>
        );

    return (
        <Card title="Statistics">
            <Alert error={error} />
            {data && (
                <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <Stat label="Total views" value={data.views} />
                        <Stat label="Today" value={data.viewsDay} />
                        <Stat label="This week" value={data.viewsWeek} />
                        <Stat label="This month" value={data.viewsMonth} />
                    </div>
                    <div>
                        <p className="font-medium">
                            Average price of {notice.model} in {regionLabel(notice.region)}
                        </p>
                        <p>
                            {data.prices.region.count
                                ? `${formatPrice(data.prices.region.average[notice.currency], notice.currency)} (${plural(data.prices.region.count, "car")})`
                                : "No data"}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium">Average price of {notice.model} in Ukraine</p>
                        <p>
                            {data.prices.market.count
                                ? `${formatPrice(data.prices.market.average[notice.currency], notice.currency)} (${plural(data.prices.market.count, "car")})`
                                : "No data"}
                        </p>
                    </div>
                </div>
            )}
        </Card>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md bg-slate-50 p-2">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    );
}

function StaffPanel({ notice, onChange }: { notice: Notice; onChange: (notice: Notice) => void }) {
    const navigate = useNavigate();
    const action = useAction();

    return (
        <Card title="Moderation">
            <div className="space-y-2">
                <p className="text-sm text-slate-500">
                    Failed profanity checks: {notice.profanityCounter}.{" "}
                    <Link to="/moderation" className="text-blue-700 hover:underline">
                        Back to moderation
                    </Link>
                </p>
                <div className="flex gap-2">
                    {notice.status !== "active" && (
                        <Button
                            disabled={action.pending}
                            onClick={async () => {
                                const updated = await action.run(
                                    () => api<Notice>(`/notice/${notice._id}/activate`, { method: "PATCH" }),
                                    "Notice activated"
                                );
                                if (updated) onChange(updated);
                            }}
                        >
                            Approve
                        </Button>
                    )}
                    <Button
                        variant="danger"
                        disabled={action.pending}
                        onClick={async () => {
                            if (!confirm("Delete this notice?")) return;
                            const ok = await action.run(() =>
                                api(`/notice/${notice._id}`, { method: "DELETE" }).then(() => true)
                            );
                            if (ok) navigate("/moderation");
                        }}
                    >
                        Delete
                    </Button>
                </div>
                <Alert error={action.error} success={action.success} />
            </div>
        </Card>
    );
}
