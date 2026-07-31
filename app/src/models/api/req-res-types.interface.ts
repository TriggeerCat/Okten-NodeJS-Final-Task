import { ITokenPayload } from "../token/token.interface";
import type { ParamsDictionary } from "express-serve-static-core";

export interface IParamsId extends ParamsDictionary {
    id: string;
}

export interface ILocalsToken {
    tokenPayload: ITokenPayload;
}
