export const PERMS_NOTICE = {
    create: "notice:create",
    update: "notice:update",
    delete: "notice:delete"
} as const;

export const PERMS_USERS = {
    promote: "users:promote",
    tenant: "users:tenant",
    ban: "users:ban"
} as const;

export type PermissionsEnum =
    (typeof PERMS_NOTICE)[keyof typeof PERMS_NOTICE] | (typeof PERMS_USERS)[keyof typeof PERMS_USERS];
