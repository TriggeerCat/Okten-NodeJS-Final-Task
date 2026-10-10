import { PERMS_NOTICE, PERMS_USERS } from "../../notice/enums/permissions.enum";

export const ROLES = {
    buyer: "buyer",
    seller: "seller",
    manager: "manager",
    administrator: "administrator"
} as const;

export type RoleEnum = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
    [ROLES.buyer]: [":3"],
    [ROLES.seller]: [PERMS_NOTICE.create],
    [ROLES.manager]: [PERMS_NOTICE.create, PERMS_USERS.ban, PERMS_USERS.tenant],
    [ROLES.administrator]: [PERMS_NOTICE.create, PERMS_USERS.ban, PERMS_USERS.promote, PERMS_USERS.tenant]
} as const satisfies Record<RoleEnum, string[]>;
