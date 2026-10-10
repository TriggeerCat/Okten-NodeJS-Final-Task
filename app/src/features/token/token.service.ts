import jwt from "jsonwebtoken";

import { ITokenPair, ITokenPayload, ITokens, ITokensDTO } from "./token.interface";
import { TokenModel } from "./token.model";
import { AuthTokens, getLifetimeByTokenType, getSecretByTokenType } from "./token.enum";
import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import envData from "../../env/env";

class TokenService {
    public getByParams(params: Partial<ITokens>) {
        return TokenModel.findOne(params);
    }

    public create(dto: ITokensDTO) {
        return TokenModel.create(dto);
    }

    public delete(params: Partial<ITokens>) {
        return TokenModel.findOneAndDelete(params);
    }

    public generateAuthTokens(payload: ITokenPayload): ITokenPair {
        const accessToken = jwt.sign(payload, getSecretByTokenType("access"), {
            expiresIn: getLifetimeByTokenType("access")
        });
        const refreshToken = jwt.sign(payload, getSecretByTokenType("refresh"), {
            expiresIn: getLifetimeByTokenType("refresh")
        });

        return { accessToken, refreshToken };
    }

    public verifyToken(token: string, type: AuthTokens): ITokenPayload {
        try {
            return jwt.verify(token, getSecretByTokenType(type)) as ITokenPayload;
        } catch (e) {
            throw new ApiError(e?.toString() ?? "", STATUS_CODES.bad_request);
        }
    }

    public async doesTokenExist(token: string, type: AuthTokens) {
        switch (type) {
            case "access":
                return !!(await this.getByParams({ accessToken: token }));
            case "refresh":
                return !!(await this.getByParams({ refreshToken: token }));
            default:
                throw new ApiError("Invalid token type", STATUS_CODES.bad_request);
        }
    }

    public async deleteExpiredTokens() {
        const tokens = await TokenModel.find();

        tokens.forEach((tokenPair) => {
            console.log(+Date.now() - +tokenPair.createdAt);
            console.log(envData.JWT_REFRESH_LIFETIME);
            console.log(+Date.now() - +tokenPair.createdAt >= envData.JWT_REFRESH_LIFETIME);
            if (+Date.now() - +tokenPair.createdAt >= envData.JWT_REFRESH_LIFETIME)
                await TokenModel.findOneAndDelete(tokenPair);
        });
    }
}

export const tokenService = new TokenService();
