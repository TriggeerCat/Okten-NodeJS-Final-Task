import { ROLE_PERMISSIONS, RoleEnum, ROLES } from "../features/user/enums/role.enum";
import { PermissionsEnum } from "../features/notice/enums/permissions.enum";

export const hasRolePermission = (role: RoleEnum, permission: PermissionsEnum) =>
    ROLE_PERMISSIONS[role ?? ROLES.buyer].includes(permission);
