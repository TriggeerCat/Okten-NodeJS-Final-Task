import jwt from "jsonwebtoken";

import { ITokenPair, ITokenPayload, ITokens, ITokensDTO } from "./token.interface";
import { TokenModel } from "./token.model";
import { AuthTokens, getLifetimeByTokenType, getSecretByTokenType } from "../../enums/token.enum";
import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";

class TokenService {
    public create(dto: ITokensDTO) {
        return TokenModel.create(dto);
    }

    public findByParams(params: Partial<ITokens>) {
        return TokenModel.findOne(params);
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
                return !!(await this.findByParams({ accessToken: token }));
            case "refresh":
                return !!(await this.findByParams({ refreshToken: token }));
            default:
                throw new ApiError("Invalid token type", STATUS_CODES.bad_request);
        }
    }
}

export const tokenService = new TokenService();
