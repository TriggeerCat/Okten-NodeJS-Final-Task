export const CURRENCIES = {
    uah: "uah",
    usd: "usd",
    eur: "eur"
} as const;

export type CurrenciesEnum = (typeof CURRENCIES)[keyof typeof CURRENCIES];
