import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import type { Currency, NoticeStatus } from "../types";
import { CURRENCIES, formatPrice } from "../constants";

const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
};

export function Button({
    variant = "primary",
    className = "",
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
    return (
        <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        />
    );
}

const fieldClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input className={fieldClass} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
    return <select className={fieldClass} {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea className={fieldClass} rows={4} {...props} />;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase">{label}</span>
            {children}
        </label>
    );
}

export function Card({ title, children, className = "" }: { title?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`rounded-lg bg-white p-4 shadow-sm ${className}`}>
            {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
            {children}
        </section>
    );
}

export function Alert({ error, success }: { error?: string | null; success?: string | null }) {
    if (error) return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
    if (success) return <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>;
    return null;
}

export function Loading() {
    return <p className="py-8 text-center text-slate-400">Loading...</p>;
}

const statusClass: Record<NoticeStatus, string> = {
    active: "bg-green-100 text-green-800",
    pending: "bg-amber-100 text-amber-800",
    inactive: "bg-red-100 text-red-800"
};

export function StatusBadge({ status }: { status: NoticeStatus }) {
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[status]}`}>{status}</span>;
}

export function Badge({ children }: { children: ReactNode }) {
    return <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">{children}</span>;
}

export function Prices({ prices, original }: { prices: Record<Currency, number>; original?: Currency }) {
    return (
        <div className="flex flex-wrap gap-x-3 text-sm text-slate-500">
            {CURRENCIES.map((currency) => (
                <span key={currency} className={currency === original ? "font-semibold text-slate-900" : ""}>
                    {formatPrice(prices[currency], currency)}
                </span>
            ))}
        </div>
    );
}

export function Pagination({
    page,
    limit,
    total,
    onChange
}: {
    page: number;
    limit: number;
    total: number;
    onChange: (page: number) => void;
}) {
    const pages = Math.max(1, Math.ceil(total / limit));
    if (pages === 1) return null;
    return (
        <div className="flex items-center justify-center gap-3 py-4 text-sm">
            <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
                Previous
            </Button>
            <span>
                Page {page} of {pages}
            </span>
            <Button variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
                Next
            </Button>
        </div>
    );
}
