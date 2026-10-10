import { IBase } from "../api/base.interface";
import { RoleEnum } from "../user/enums/role.enum";

export interface ITokens extends IBase {
    _id: string;
    accessToken: string;
    refreshToken: string;
    userId: string;
}

export interface ITokenPayload {
    userId: string;
    role: RoleEnum;
    tenant: string | null;
}

export type ITokensDTO = Pick<ITokens, "accessToken" | "refreshToken" | "userId">;
export type ITokenPair = Pick<ITokens, "accessToken" | "refreshToken">;
export type IRefreshToken = Pick<ITokens, "refreshToken">;
