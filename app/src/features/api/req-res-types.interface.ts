import { ITokenPayload } from "../token/token.interface";
import type { ParamsDictionary } from "express-serve-static-core";

export interface IParamsId extends ParamsDictionary {
    id: string;
}

export interface IParamsBrand extends ParamsDictionary {
    brand: string;
}

export interface ILocalsToken {
    tokenPayload: ITokenPayload;
}

export interface ILocalsQuery<T> {
    validQuery: T;
}

export type ILocalsTokenQuery<T> = ILocalsToken & ILocalsQuery<T>;
