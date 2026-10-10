export const CURRENCY = {
    uah: "uah",
    usd: "usd",
    eur: "eur"
} as const;

export type CurrencyEnum = (typeof CURRENCY)[keyof typeof CURRENCY];
