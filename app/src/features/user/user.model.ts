import { model, Schema } from "mongoose";
import { IUser } from "./user.interface";
import { ROLES } from "./enums/role.enum";

export const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { enum: Object.values(ROLES), type: String, required: true, default: ROLES.buyer, index: true },
        isBanned: { type: Boolean, default: false },
        isPremium: { type: Boolean, default: false },
        tenant: { type: String, default: null, index: true },
        tenantRequest: { type: String, default: null }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret: Record<string, any>) => {
                delete ret.password;
                return ret;
            }
        }
    }
);

export const UserModel = model<IUser>("user", UserSchema);
