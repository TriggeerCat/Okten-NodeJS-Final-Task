export const CURRENCIES = {
    uah: "uah",
    usd: "usd",
    eur: "eur"
} as const;

export type CurrenciesEnum = (typeof CURRENCIES)[keyof typeof CURRENCIES];

export const CURRENCIES_RELATION = {
    [CURRENCIES.uah]: 1,
    [CURRENCIES.usd]: 45,
    [CURRENCIES.eur]: 52
} as const;
