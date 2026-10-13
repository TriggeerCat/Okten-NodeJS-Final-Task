import type { Currency, User } from "./types";

// mirrors app/src/features/notice/enums/regions.enum.ts
export const REGIONS = [
    "vinnytsia",
    "dnipro",
    "donetsk",
    "zhytomyr",
    "uzhhorod",
    "zaporizhzhia",
    "ivano-frankivsk",
    "kyiv",
    "kropyvnytskyi",
    "luhansk",
    "lutsk",
    "lviv",
    "mykolaiv",
    "odesa",
    "poltava",
    "rivne",
    "sumy",
    "ternopil",
    "kharkiv",
    "kherson",
    "khmelnytskyi",
    "cherkasy",
    "chernivtsi",
    "chernihiv",
    "simferopol",
    "kyiv-city",
    "sevastopol"
] as const;

export const CURRENCIES: Currency[] = ["uah", "usd", "eur"];

// shown on the dummy payment page, in UAH
export const PREMIUM_PRICE = 299;

// mirrors MAX_DESCRIPTION_ATTEMPTS in the backend
export const MAX_DESCRIPTION_ATTEMPTS = 3;

export const regionLabel = (region: string) =>
    region
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ");

export const formatPrice = (value: number, currency: Currency) =>
    new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: 0
    }).format(value);

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export const formatDate =(date: string) => new Date(date).toLocaleString("uk-UA");

// coarse role checks for showing UI, the backend still decides
export const isStaff = (user: User | null) => user?.role === "manager" || user?.role === "administrator";
export const isAdmin = (user: User | null) => user?.role === "administrator";
export const isPlatformAdmin = (user: User | null) => isAdmin(user) && !user?.tenant;
export const canSell = (user: User | null) => !!user && user.role !== "buyer";
