import { UserModel } from "./user.model";
import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { IUser, IUserCreateDTO, IUserDealerCreateDTO, IUserUpdateDTO } from "./user.interface";
import { RoleEnum, ROLES } from "./enums/role.enum";
import { PERMS_USERS } from "../../enums/permissions.enum";
import { tokenService } from "../token/token.service";
import { ITokenPayload } from "../token/token.interface";
import { assertRolePermission, hasRolePermission } from "../../utils/hasRolePermission";
import { IPaginated, IPaginationQuery, toSkip } from "../api/pagination";
import { NoticeModel } from "../notice/notice.model";
import { NoticeViewModel } from "../notice/features/view/view.model";

type TenantType = string | null;

// test card that always fails, to try the declined payment flow
const DECLINED_TEST_CARD = "4000000000000002";

class UserService {
    // GET
    public async getAll(pagination: IPaginationQuery, actor: ITokenPayload): Promise<IPaginated<IUser>> {
        // tenant staff only sees users of its own tenant and users asking to join it
        const filter = actor.tenant ? { $or: [{ tenant: actor.tenant }, { tenantRequest: actor.tenant }] } : {};
        const [data, total] = await Promise.all([
            UserModel.find(filter).sort({ createdAt: -1 }).skip(toSkip(pagination)).limit(pagination.limit),
            UserModel.countDocuments(filter)
        ]);
        return { data, total, ...pagination };
    }

    public async getById(id: string) {
        const user = await UserModel.findById(id);
        if (!user) throw new ApiError("User not found", STATUS_CODES.not_found);
        return user;
    }

    public getByEmailWithPassword(email: string) {
        return UserModel.findOne({ email }).select("+password");
    }

    public async getIdsByTenant(tenant: string) {
        const ids = await UserModel.find({ tenant }).distinct("_id");
        return ids.map((id) => id.toString());
    }

    public async getPlatformStaffEmails() {
        const staff = await UserModel.find(
            { role: { $in: [ROLES.manager, ROLES.administrator] }, tenant: null, isBanned: false },
            { email: 1 }
        ).lean();
        return staff.map((user) => user.email);
    }

    public async getPlatformAdminEmails() {
        const admins = await UserModel.find(
            { role: ROLES.administrator, tenant: null, isBanned: false },
            { email: 1 }
        ).lean();
        return admins.map((user) => user.email);
    }

    // CREATE
    public createUser(user: IUserCreateDTO) {
        return UserModel.create({ ...user, role: ROLES.buyer });
    }

    public async createDealershipAdmin(user: IUserDealerCreateDTO) {
        // otherwise anyone could sign up as an administrator of an existing dealership
        if (await UserModel.exists({ tenant: user.tenant }))
            throw new ApiError("This dealership already exists", STATUS_CODES.conflict);
        return await UserModel.create({ ...user, role: ROLES.administrator });
    }

    // UPDATE
    public async updateById(id: string, newUser: IUserUpdateDTO, actor: ITokenPayload) {
        this.assertSelf(id, actor);
        if (newUser.email) await this.isEmailUnique(newUser.email, id);
        return await this.updateWithError(id, newUser);
    }

    // PREMIUM
    public async upgradeToPremium(id: string, actor: ITokenPayload) {
        // there is no payment flow yet, so premium is granted by platform administrators
        assertRolePermission(actor.role, PERMS_USERS.premium);
        this.assertPlatformStaff(actor);

        const user = await this.getById(id);
        if (user.isPremium) throw new ApiError("User is already premium", STATUS_CODES.conflict);
        return await this.updateWithError(id, { isPremium: true });
    }

    // dummy payment page, no real payment provider is involved
    public async purchasePremium(actor: ITokenPayload, cardNumber: string) {
        const user = await this.getById(actor.userId);
        if (user.isPremium) throw new ApiError("You already have premium", STATUS_CODES.conflict);
        if (cardNumber === DECLINED_TEST_CARD)
            throw new ApiError("Payment declined by the bank", STATUS_CODES.payment_required);
        return await this.updateWithError(actor.userId, { isPremium: true });
    }

    // TENANT
    public async requestTenant(actor: ITokenPayload, tenant: string) {
        const user = await this.getById(actor.userId);
        if (user.tenant) throw new ApiError("You already belong to a tenant", STATUS_CODES.bad_request);
        if (!(await UserModel.exists({ tenant }))) throw new ApiError("Tenant not found", STATUS_CODES.not_found);
        return await this.updateWithError(actor.userId, { tenantRequest: tenant });
    }

    public async makeTenant(id: string, actor: ITokenPayload) {
        assertRolePermission(actor.role, PERMS_USERS.tenant);
        if (!actor.tenant) throw new ApiError("You are not a tenant", STATUS_CODES.forbidden);

        const user = await this.getById(id);
        if (user.tenant) throw new ApiError("User is already a tenant", STATUS_CODES.bad_request);
        if (user.tenantRequest !== actor.tenant)
            throw new ApiError("User did not request to join your tenant", STATUS_CODES.forbidden);

        return await this.updateWithError(id, { tenant: actor.tenant, tenantRequest: null });
    }

    public async removeTenant(id: string, actor: ITokenPayload) {
        assertRolePermission(actor.role, PERMS_USERS.tenant);

        const user = await this.getById(id);

        this.validateTenant(user, actor.tenant);
        if (!user.tenant) throw new ApiError("User is already not a tenant", STATUS_CODES.bad_request);
        if (this.doesUserHaveRole(user, [ROLES.administrator]))
            throw new ApiError("You can't remove an administrator from a tenant", STATUS_CODES.forbidden);

        return await this.updateWithError(id, { tenant: null, role: ROLES.buyer });
    }

    // PROMOTE
    public async promoteBuyerToSeller(id: string, actor: ITokenPayload) {
        // users may become sellers themselves, others need the promote permission
        if (id !== actor.userId) assertRolePermission(actor.role, PERMS_USERS.promote);

        const user = await this.getById(id);
        if (id !== actor.userId) this.validateTenant(user, actor.tenant);
        if (!this.doesUserHaveRole(user, [ROLES.buyer]))
            throw new ApiError("This users role isn't buyer", STATUS_CODES.bad_request);

        return await this.updateWithError(id, { role: ROLES.seller });
    }

    public async promoteToManager(id: string, actor: ITokenPayload) {
        assertRolePermission(actor.role, PERMS_USERS.promote);

        const user = await this.getById(id);

        this.validateTenant(user, actor.tenant);
        if (this.doesUserHaveRole(user, [ROLES.manager, ROLES.administrator]))
            throw new ApiError("This user is already promoted", STATUS_CODES.bad_request);

        return await this.updateWithError(id, { role: ROLES.manager });
    }

    public async demoteToBuyer(id: string, actor: ITokenPayload) {
        assertRolePermission(actor.role, PERMS_USERS.promote);

        const user = await this.getById(id);

        this.validateTenant(user, actor.tenant);
        if (this.doesUserHaveRole(user, [ROLES.administrator]))
            throw new ApiError("You can't demote an administrator", STATUS_CODES.forbidden);

        return await this.updateWithError(id, { role: ROLES.buyer });
    }

    // BAN
    public async setBanStatus(id: string, newBanStatus: boolean, actor: ITokenPayload) {
        assertRolePermission(actor.role, PERMS_USERS.ban);
        if (id === actor.userId) throw new ApiError("You can't ban yourself", STATUS_CODES.bad_request);

        const user = await this.getById(id);

        this.validateTenant(user, actor.tenant);
        if (this.doesUserHaveRole(user, [ROLES.administrator]))
            throw new ApiError("You can't ban an administrator", STATUS_CODES.forbidden);

        if (newBanStatus) await tokenService.deleteAllByUserId(id);
        return await this.updateWithError(id, { isBanned: newBanStatus });
    }

    // DELETE
    public async delete(id: string, actor: ITokenPayload) {
        const user = await this.getById(id);

        if (id !== actor.userId) {
            assertRolePermission(actor.role, PERMS_USERS.delete);
            this.validateTenant(user, actor.tenant);
            if (this.doesUserHaveRole(user, [ROLES.administrator]))
                throw new ApiError("You can't delete an administrator", STATUS_CODES.forbidden);
        }

        const noticeIds = await NoticeModel.find({ creatorId: id }).distinct("_id");
        await Promise.all([
            tokenService.deleteAllByUserId(id),
            NoticeModel.deleteMany({ creatorId: id }),
            NoticeViewModel.deleteMany({ noticeId: { $in: noticeIds } })
        ]);
        await UserModel.findByIdAndDelete(id);
    }

    // UTILS
    public async isEmailUnique(email: string, exceptUserId?: string) {
        const user = await UserModel.exists({ email, ...(exceptUserId ? { _id: { $ne: exceptUserId } } : {}) });
        if (user) throw new ApiError("This email already exists", STATUS_CODES.conflict);
    }

    public doesUserHaveRole(user: IUser, roles: RoleEnum[]) {
        return roles.includes(user.role);
    }

    // actors without a tenant are platform staff and may act on anyone
    public validateTenant(user: IUser, tenant: TenantType) {
        if (tenant && user.tenant !== tenant)
            throw new ApiError("This user does not belong to your tenancy", STATUS_CODES.forbidden);
    }

    public canModerate(actor: ITokenPayload, permission: Parameters<typeof hasRolePermission>[1], owner: IUser | null) {
        if (!hasRolePermission(actor.role, permission)) return false;
        return !actor.tenant || owner?.tenant === actor.tenant;
    }

    private assertSelf(id: string, actor: ITokenPayload) {
        if (id !== actor.userId) throw new ApiError("You can only change your own account", STATUS_CODES.forbidden);
    }

    private assertPlatformStaff(actor: ITokenPayload) {
        if (actor.tenant) throw new ApiError("Only platform staff can do that", STATUS_CODES.forbidden);
    }

    private async updateWithError(id: string, update: Partial<IUser>) {
        const user = await UserModel.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true });
        if (!user) throw new ApiError("User not found", STATUS_CODES.not_found);
        return user;
    }
}

export const userService = new UserService();
