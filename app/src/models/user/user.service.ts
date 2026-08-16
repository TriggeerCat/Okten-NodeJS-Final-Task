import { UserModel } from "./user.model";
import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { IUser, IUserDealerCreateDTO, IUserCreateDTO } from "./user.interface";
import { ROLE_PERMISSIONS, RoleEnum, ROLES } from "../../enums/role.enum";
import { PermissionsEnum, PERMS_USERS } from "../../enums/permissions.enum";
import { tokenService } from "../token/token.service";

type TenantType = string | null;

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
    public async makeTenant(id: string, tenant: TenantType, clientsRole: RoleEnum) {
        if (!tenant) throw new ApiError("You are not a tenant", STATUS_CODES.forbidden);
        this.validateRolePermissions(clientsRole, PERMS_USERS.tenant);

        const user = await this.getById(id);
        if (user.tenant) throw new ApiError("User is already a tenant", STATUS_CODES.bad_request);
        return await UserModel.findByIdAndUpdate(id, { tenant }, { returnDocument: "after" });
    }

    public async removeTenant(id: string, tenant: TenantType, clientsRole: RoleEnum) {
        this.validateRolePermissions(clientsRole, PERMS_USERS.tenant);

        const user = await this.getById(id);

        this.validateTenant(user, tenant);
        if (!user.tenant) throw new ApiError("User is already not a tenant", STATUS_CODES.bad_request);

        return await UserModel.findByIdAndUpdate(id, { tenant: null }, { returnDocument: "after" });
    }

    // PROMOTE
    public async promoteBuyerToSeller(id: string) {
        const user = await this.getById(id);
        if (this.doesUserHaveRole(user, [ROLES.buyer]))
            return await UserModel.findByIdAndUpdate(id, { role: ROLES.seller }, { returnDocument: "after" });
        throw new ApiError("This users role isn't buyer", STATUS_CODES.bad_request);
    }

    public async promoteToManager(id: string, tenant: TenantType, clientsRole: RoleEnum) {
        this.validateRolePermissions(clientsRole, PERMS_USERS.promote);

        const user = await this.getById(id);

        this.validateTenant(user, tenant);
        if (this.doesUserHaveRole(user, [ROLES.manager, ROLES.administrator]))
            throw new ApiError("This user is already promoted", STATUS_CODES.bad_request);

        return await UserModel.findByIdAndUpdate(id, { role: ROLES.manager }, { returnDocument: "after" });
    }

    public async demoteToBuyer(id: string, tenant: TenantType, clientsRole: RoleEnum) {
        this.validateRolePermissions(clientsRole, PERMS_USERS.promote);

        const user = await this.getById(id);

        this.validateTenant(user, tenant);
        if (this.doesUserHaveRole(user, [ROLES.administrator]))
            throw new ApiError("You can't demote an administrator", STATUS_CODES.forbidden);

        return await UserModel.findByIdAndUpdate(id, { role: ROLES.buyer }, { returnDocument: "after" });
    }

    // BAN
    public async setBanStatus(id: string, newBanStatus: boolean, tenant: TenantType, clientsRole: RoleEnum) {
        this.validateRolePermissions(clientsRole, PERMS_USERS.ban);
        const user = await this.getById(id);
        this.validateTenant(user, tenant);
        if (newBanStatus) await tokenService.delete({ userId: id });
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

    public doesUserHaveRole(user: IUser, roles: RoleEnum[]) {
        return roles.includes(user.role);
    }

    public validateTenant(user: IUser, tenant: TenantType) {
        if (tenant && user.tenant !== tenant)
            throw new ApiError("This user does not belong to your tenancy", STATUS_CODES.bad_request);
    }

    public validateRolePermissions(role: RoleEnum, permission: PermissionsEnum) {
        if (!ROLE_PERMISSIONS[role].includes(permission))
            throw new ApiError("Role does not have that permission!", STATUS_CODES.bad_request);
    }
}

export const userService = new UserService();
