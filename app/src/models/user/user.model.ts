import { model, Schema } from "mongoose";
import { IUser } from "./user.interface";
import { ROLES } from "../../enums/role.enum";

export const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { enum: Object.values(ROLES), type: String, required: true, default: ROLES.buyer },
        isBanned: { type: Boolean, default: false },
        isPremium: { type: Boolean, default: false },
        tenant: { type: String, default: null }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                ret.password = "[********]";
            }
        }
    }
);

export const UserModel = model<IUser>("user", UserSchema);
