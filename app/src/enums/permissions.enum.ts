export const PERMS_NOTICE = {
    create: "notice:create",
    // update/delete notices that belong to other users
    update: "notice:update",
    delete: "notice:delete"
} as const;

export const PERMS_USERS = {
    read: "users:read",
    promote: "users:promote",
    tenant: "users:tenant",
    ban: "users:ban",
    delete: "users:delete",
    premium: "users:premium"
} as const;

export const PERMS_CATALOG = {
    create: "catalog:create"
} as const;

export type PermissionsEnum =
    | (typeof PERMS_NOTICE)[keyof typeof PERMS_NOTICE]
    | (typeof PERMS_USERS)[keyof typeof PERMS_USERS]
    | (typeof PERMS_CATALOG)[keyof typeof PERMS_CATALOG];
