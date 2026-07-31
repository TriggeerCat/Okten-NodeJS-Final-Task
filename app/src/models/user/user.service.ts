import { UserModel } from "./user.model";
import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { IUser, IUserDealerCreateDTO, IUserCreateDTO } from "./user.interface";
import { RoleEnum, ROLES } from "../../enums/role.enum";

class UserService {
    // GET
    public getAll() {
        return UserModel.find();
    }

    public async getById(id: string) {
        const user = await UserModel.findById(id);
        if (!user) throw new ApiError("User not found", STATUS_CODES.not_found);
        return user;
    }

    public getByEmail(email: string) {
        return UserModel.findOne({ email });
    }

    // CREATE
    public createUser(user: IUserCreateDTO) {
        return UserModel.create({ ...user, role: ROLES.buyer });
    }

    public createDealershipAdmin(user: IUserDealerCreateDTO) {
        return UserModel.create({ ...user, role: ROLES.administrator });
    }

    // UPDATE
    public async updateById(id: string, newUser: Partial<IUser>) {
        const user = await UserModel.findByIdAndUpdate(id, newUser, { returnDocument: "after" });
        if (!user) throw new ApiError("User not found", STATUS_CODES.not_found);
        return user;
    }

    // PREMIUM
    public async upgradeToPremium(id: string) {
        const user = await this.getById(id);
        if (user.isPremium) throw new ApiError("User is already premium", STATUS_CODES.not_found);
        return await UserModel.findByIdAndUpdate(id, { isPremium: true }, { returnDocument: "after" });
    }

    // TENANT
    public async makeTenant(id: string, tenant: string | null) {
        if (!tenant) throw new ApiError("You are not a tenant", STATUS_CODES.forbidden);
        const user = await this.getById(id);
        if (user.tenant) throw new ApiError("User is already a tenant", STATUS_CODES.bad_request);
        return await UserModel.findByIdAndUpdate(id, { tenant }, { returnDocument: "after" });
    }

    public async removeTenant(id: string) {
        const user = await this.getById(id);
        if (!user.tenant) throw new ApiError("User is already not a tenant", STATUS_CODES.bad_request);
        return await UserModel.findByIdAndUpdate(id, { tenant: null }, { returnDocument: "after" });
    }

    // PROMOTE
    public async promoteBuyerToSeller(id: string) {
        if (await this.doesUserHaveRole(id, [ROLES.buyer]))
            return await UserModel.findByIdAndUpdate(id, { role: ROLES.seller }, { returnDocument: "after" });
        throw new ApiError("This users role isn't buyer", STATUS_CODES.bad_request);
    }

    public async promoteToManager(id: string) {
        if (await this.doesUserHaveRole(id, [ROLES.manager, ROLES.administrator]))
            throw new ApiError("This user is already promoted", STATUS_CODES.bad_request);
        return await UserModel.findByIdAndUpdate(id, { role: ROLES.manager }, { returnDocument: "after" });
    }

    public async demoteToBuyer(id: string) {
        if (await this.doesUserHaveRole(id, [ROLES.administrator]))
            throw new ApiError("You can't demote an administrator", STATUS_CODES.forbidden);
        return await UserModel.findByIdAndUpdate(id, { role: ROLES.buyer }, { returnDocument: "after" });
    }

    // BAN
    public async setBanStatus(id: string, newBanStatus: boolean) {
        const { isBanned } = await this.getById(id);
        if (isBanned === newBanStatus)
            throw new ApiError(`This user is already ${isBanned ? "banned" : "unbanned"}`, STATUS_CODES.bad_request);
        return await UserModel.findByIdAndUpdate(id, { isBanned: newBanStatus }, { returnDocument: "after" });
    }

    // DELETE
    public async delete(id: string) {
        await this.getById(id);
        return await UserModel.findByIdAndDelete(id, { returnDocument: "after" });
    }

    // UTILS
    public async isEmailUnique(email: string) {
        const user = await this.getByEmail(email);
        if (user) throw new ApiError("This email already exists", STATUS_CODES.forbidden);
    }

    public async doesUserHaveRole(id: string, roles: RoleEnum[]) {
        const { role } = await this.getById(id);
        return roles.includes(role);
    }
}

export const userService = new UserService();
