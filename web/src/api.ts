import { useCallback, useEffect, useState } from "react";
import type { Tokens } from "./types";

// proxied to the backend by vite (see vite.config.ts)
const BASE_URL = "/api";
const TOKENS_KEY = "tokens";

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message);
    }
}

export const tokenStorage = {
    get(): Tokens | null {
        try {
            return JSON.parse(localStorage.getItem(TOKENS_KEY) ?? "null");
        } catch {
            return null;
        }
    },
    set(tokens: Tokens | null) {
        if (tokens) localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
        else localStorage.removeItem(TOKENS_KEY);
    }
};

// refresh tokens are single use, so parallel requests must share one refresh call
let refreshing: Promise<boolean> | null = null;

const refreshTokens = () => {
    const tokens = tokenStorage.get();
    if (!tokens) return Promise.resolve(false);

    refreshing ??= fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
    })
        .then(async (response) => {
            if (!response.ok) {
                tokenStorage.set(null);
                return false;
            }
            tokenStorage.set(await response.json());
            return true;
        })
        .catch(() => false)
        .finally(() => {
            refreshing = null;
        });

    return refreshing;
};

interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
}

export async function api<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
    const tokens = tokenStorage.get();
    const response = await fetch(BASE_URL + path, {
        method: options.method ?? "GET",
        headers: {
            ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {})
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    });

    if (response.status === 401 && tokens && retry) {
        if (await refreshTokens()) return api<T>(path, options, false);
        window.dispatchEvent(new Event("auth:logout"));
    }

    if (response.status === 204) return undefined as T;

    const data = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(data?.message ?? `Request failed (${response.status})`, response.status);
    return data as T;
}

export const toQuery = (params: Record<string, string | number | undefined | null>) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
    });
    const query = search.toString();
    return query ? `?${query}` : "";
};

// loads data for a page, pass null to skip loading
export function useApi<T>(path: string | null) {
    const [data, setData] = useState<T | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(!!path);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (!path) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        api<T>(path)
            .then((result) => !cancelled && setData(result))
            .catch((e: Error) => !cancelled && setError(e.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [path, version]);

    const reload = useCallback(() => setVersion((v) => v + 1), []);
    return { data, error, loading, reload, setData };
}

// runs a user action (button click, form submit) and keeps its error/success message
export function useAction() {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const run = async <T,>(action: () => Promise<T>, successMessage?: string): Promise<T | undefined> => {
        setPending(true);
        setError(null);
        setSuccess(null);
        try {
            const result = await action();
            if (successMessage) setSuccess(successMessage);
            return result;
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            return undefined;
        } finally {
            setPending(false);
        }
    };

    return { pending, error, success, run };
}
