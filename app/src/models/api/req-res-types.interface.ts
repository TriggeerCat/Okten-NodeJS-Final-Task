import { ITokenPayload } from "../token/token.interface";
import type { ParamsDictionary } from "express-serve-static-core";
import { RegionsEnum } from "../../enums/regions.enum";

export interface IParamsId extends ParamsDictionary {
    id: string;
}

export interface IParamsRegion extends ParamsDictionary {
    region: RegionsEnum;
}

export interface ILocalsToken {
    tokenPayload: ITokenPayload;
}
