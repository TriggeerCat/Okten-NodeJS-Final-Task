import { model, Schema } from "mongoose";
import { ITokens } from "./token.interface";

const TokenSchema = new Schema(
    {
        accessToken: { type: String, required: true },
        refreshToken: { type: String, required: true },
        _userId: { type: String, required: true }
    },
    { timestamps: true, versionKey: false }
);

export const TokenModel = model<ITokens>("tokens", TokenSchema);
