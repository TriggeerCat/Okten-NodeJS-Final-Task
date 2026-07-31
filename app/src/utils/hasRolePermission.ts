import { ROLE_PERMISSIONS, RoleEnum, ROLES } from "../enums/role.enum";
import { PermissionsEnum } from "../enums/permissions.enum";

export const hasRolePermission = (role: RoleEnum, permission: PermissionsEnum) =>
    ROLE_PERMISSIONS[role ?? ROLES.buyer].includes(permission);
