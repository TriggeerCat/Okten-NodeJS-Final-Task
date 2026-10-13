import { model, Schema } from "mongoose";
import { ITokens } from "./token.interface";
import envData from "../../env/env";

const TokenSchema = new Schema(
    {
        accessToken: { type: String, required: true, index: true },
        refreshToken: { type: String, required: true, index: true },
        userId: { type: String, required: true, index: true }
    },
    { timestamps: true, versionKey: false }
);

// MongoDB removes token pairs on its own once the refresh token has expired
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: Math.ceil(envData.JWT_REFRESH_LIFETIME / 1000) });

export const TokenModel = model<ITokens>("tokens", TokenSchema);
