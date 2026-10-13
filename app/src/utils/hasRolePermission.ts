import { ROLE_PERMISSIONS, RoleEnum } from "../features/user/enums/role.enum";
import { PermissionsEnum } from "../enums/permissions.enum";
import { ApiError } from "../features/api/api.error";
import { STATUS_CODES } from "../enums/status-codes.enum";

export const hasRolePermission = (role: RoleEnum, permission: PermissionsEnum) =>
    ROLE_PERMISSIONS[role]?.includes(permission) ?? false;

export const assertRolePermission = (role: RoleEnum, permission: PermissionsEnum) => {
    if (!hasRolePermission(role, permission))
        throw new ApiError("Role does not have that permission", STATUS_CODES.forbidden);
};
