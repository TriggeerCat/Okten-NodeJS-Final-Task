import { PERMS_CATALOG, PERMS_NOTICE, PERMS_USERS, PermissionsEnum } from "../../../enums/permissions.enum";

export const ROLES = {
    buyer: "buyer",
    seller: "seller",
    manager: "manager",
    administrator: "administrator"
} as const;

export type RoleEnum = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_PERMISSIONS: Record<RoleEnum, readonly PermissionsEnum[]> = {
    [ROLES.buyer]: [],
    [ROLES.seller]: [PERMS_NOTICE.create],
    [ROLES.manager]: [
        PERMS_NOTICE.create,
        PERMS_NOTICE.update,
        PERMS_NOTICE.delete,
        PERMS_USERS.read,
        PERMS_USERS.ban,
        PERMS_USERS.tenant
    ],
    [ROLES.administrator]: [
        PERMS_NOTICE.create,
        PERMS_NOTICE.update,
        PERMS_NOTICE.delete,
        PERMS_USERS.read,
        PERMS_USERS.ban,
        PERMS_USERS.promote,
        PERMS_USERS.tenant,
        PERMS_USERS.delete,
        PERMS_USERS.premium,
        PERMS_CATALOG.create
    ]
};
