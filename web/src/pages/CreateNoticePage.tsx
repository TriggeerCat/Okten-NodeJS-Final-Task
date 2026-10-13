import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api, useAction, useApi } from "../api";
import { useAuth } from "../auth";
import type { Currency, Notice } from "../types";
import { CURRENCIES, REGIONS, canSell, regionLabel } from "../constants";
import { BrandModelFields } from "../components/catalog";
import { Alert, Button, Card, Field, Input, Select, TextArea } from "../components/ui";

export function CreateNoticePage() {
    const { user, reload } = useAuth();
    const navigate = useNavigate();
    const create = useAction();
    const promote = useAction();
    const { data: myNotices } = useApi<{ total: number }>(canSell(user) ? "/notice/my?limit=1" : null);
    const [form, setForm] = useState({
        brand: "",
        model: "",
        region: "kyiv",
        price: "",
        currency: "usd" as Currency,
        description: ""
    });

    if (!user) return null;

    if (!canSell(user))
        return (
            <Card title="Become a seller">
                <p className="mb-3 text-sm">Your account is a buyer account. Switch it to a seller account to post cars.</p>
                <Alert error={promote.error} />
                <Button
                    disabled={promote.pending}
                    onClick={() =>
                        promote.run(async () => {
                            await api(`/users/${user._id}/promote/seller`, { method: "PATCH" });
                            await reload();
                        })
                    }
                >
                    Become a seller
                </Button>
            </Card>
        );

    const limitReached = !user.isPremium && (myNotices?.total ?? 0) >= 1;

    return (
        <>
            <Card title="Sell a car">
                {limitReached && (
                    <div className="mb-3 space-y-2">
                        <Alert error="Basic accounts can only have one notice. Get premium to post more cars." />
                        <Link to="/premium" className="text-sm text-blue-700 hover:underline">
                            Get premium
                        </Link>
                    </div>
                )}
                <form
                    className="grid gap-3 sm:grid-cols-2"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const notice = await create.run(() =>
                            api<Notice>("/notice", { method: "POST", body: { ...form, price: Number(form.price) } })
                        );
                        if (notice) navigate(`/notices/${notice._id}`);
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
                                required
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
                    <div className="sm:col-span-2">
                        <Field label="Description">
                            <TextArea
                                required
                                minLength={3}
                                maxLength={500}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </Field>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <p className="text-xs text-slate-400">
                            The price in other currencies is calculated with the PrivatBank rate and updated daily.
                            Descriptions are checked for profanity automatically.
                        </p>
                        <Alert error={create.error} />
                        <Button disabled={create.pending || limitReached}>Post notice</Button>
                    </div>
                </form>
            </Card>
            <ReportMissing />
            <p className="text-center text-sm text-slate-500">
                <Link to="/my" className="text-blue-700 hover:underline">
                    See your notices
                </Link>
            </p>
        </>
    );
}

function ReportMissing() {
    const report = useAction();
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");

    return (
        <Card title="Can't find your brand or model?">
            <form
                className="grid gap-3 sm:grid-cols-3"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const ok = await report.run(
                        () =>
                            api("/notice/catalog/report-missing", {
                                method: "POST",
                                body: { brand, ...(model ? { model } : {}) }
                            }).then(() => true),
                        "Thanks! The administration will add it soon."
                    );
                    if (ok) {
                        setBrand("");
                        setModel("");
                    }
                }}
            >
                <Field label="Brand">
                    <Input required value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Daewoo" />
                </Field>
                <Field label="Model (optional)">
                    <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Lanos" />
                </Field>
                <div className="flex items-end">
                    <Button variant="secondary" disabled={report.pending}>
                        Report to administration
                    </Button>
                </div>
                <div className="sm:col-span-3">
                    <Alert error={report.error} success={report.success} />
                </div>
            </form>
        </Card>
    );
}
