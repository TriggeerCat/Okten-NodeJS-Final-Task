export const NOTICE_STATUS = {
    // passed the profanity check, visible to everyone
    active: "active",
    // failed the profanity check, the seller can still edit the description
    pending: "pending",
    // failed the profanity check too many times, waits for a manager
    inactive: "inactive"
} as const;

export type NoticeStatusEnum = (typeof NOTICE_STATUS)[keyof typeof NOTICE_STATUS];

export const MAX_DESCRIPTION_ATTEMPTS = 3;
