export type Role = "buyer" | "seller" | "manager" | "administrator";
export type Currency = "uah" | "usd" | "eur";
export type NoticeStatus = "active" | "pending" | "inactive";

export interface User {
    _id: string;
    name: string;
    email: string;
    role: Role;
    isBanned: boolean;
    isPremium: boolean;
    tenant: string | null;
    tenantRequest: string | null;
    createdAt: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    user: User;
    tokens: Tokens;
}

export interface Notice {
    _id: string;
    brand: string;
    model: string;
    region: string;
    description: string;
    price: number;
    currency: Currency;
    prices: Record<Currency, number>;
    exchangeRate: { usd: number; eur: number; date: string };
    viewsCount: number;
    creatorId: string;
    status: NoticeStatus;
    profanityCounter: number;
    createdAt: string;
    updatedAt: string;
    seller?: { _id: string; name: string; email: string; dealership: string | null } | null;
}

export interface Paginated<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
}

export interface Brand {
    _id: string;
    brand: string;
    name: string;
}

export interface CarModel {
    _id: string;
    brandId: string;
    model: string;
}

export interface AveragePrice {
    count: number;
    average: Record<Currency, number>;
}

export interface PremiumStats {
    views: number;
    viewsDay: number;
    viewsWeek: number;
    viewsMonth: number;
    prices: { market: AveragePrice; region: AveragePrice };
}
