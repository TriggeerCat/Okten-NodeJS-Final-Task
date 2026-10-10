import { IBase } from "../api/base.interface";
import { RoleEnum } from "./enums/role.enum";

export interface IUser extends IBase {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: RoleEnum;
    isBanned: boolean;
    isPremium: boolean;
    tenant: string | null;
}

export type IUserCreateDTO = Pick<IUser, "name" | "email" | "password">;
export type IUserDealerCreateDTO = Pick<IUser, "name" | "email" | "password" | "tenant">;
export type IUserAuthDTO = Pick<IUser, "email" | "password">;
