import jwt from "jsonwebtoken";

import { ITokenPair, ITokenPayload, ITokensDTO } from "./token.interface";
import { TokenModel } from "./token.model";
import { AuthTokens, getLifetimeByTokenType, getSecretByTokenType } from "./token.enum";
import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";

class TokenService {
    public create(dto: ITokensDTO) {
        return TokenModel.create(dto);
    }

    public async createForUser(payload: ITokenPayload) {
        const tokens = this.generateAuthTokens(payload);
        await this.create({ ...tokens, userId: payload.userId });
        return tokens;
    }

    public deleteByRefreshToken(refreshToken: string) {
        return TokenModel.deleteOne({ refreshToken });
    }

    public deleteByAccessToken(accessToken: string) {
        return TokenModel.deleteOne({ accessToken });
    }

    public deleteAllByUserId(userId: string) {
        return TokenModel.deleteMany({ userId });
    }

    public generateAuthTokens(payload: ITokenPayload): ITokenPair {
        const { userId, role, tenant } = payload;
        const accessToken = jwt.sign({ userId, role, tenant }, getSecretByTokenType("access"), {
            expiresIn: getLifetimeByTokenType("access")
        });
        const refreshToken = jwt.sign({ userId, role, tenant }, getSecretByTokenType("refresh"), {
            expiresIn: getLifetimeByTokenType("refresh")
        });

        return { accessToken, refreshToken };
    }

    public verifyToken(token: string, type: AuthTokens): ITokenPayload {
        try {
            return jwt.verify(token, getSecretByTokenType(type)) as ITokenPayload;
        } catch {
            throw new ApiError("Invalid or expired token", STATUS_CODES.unauthorized);
        }
    }

    public async doesTokenExist(token: string, type: AuthTokens) {
        const filter = type === "access" ? { accessToken: token } : { refreshToken: token };
        return !!(await TokenModel.exists(filter));
    }
}

export const tokenService = new TokenService();
