import envData from "../../env/env";

const AUTH_TOKEN_ENUM = {
    access: "access",
    refresh: "refresh"
} as const;

export type AuthTokens = (typeof AUTH_TOKEN_ENUM)[keyof typeof AUTH_TOKEN_ENUM];

export const getSecretByTokenType = (tokenType: AuthTokens) => {
    switch (tokenType) {
        case AUTH_TOKEN_ENUM.access:
            return envData.JWT_ACCESS_SECRET;
        case AUTH_TOKEN_ENUM.refresh:
            return envData.JWT_REFRESH_SECRET;
    }
};

export const getLifetimeByTokenType = (tokenType: AuthTokens) => {
    switch (tokenType) {
        case AUTH_TOKEN_ENUM.access:
            return envData.JWT_ACCESS_LIFETIME;
        case AUTH_TOKEN_ENUM.refresh:
            return envData.JWT_REFRESH_LIFETIME;
    }
};
