import { IEmailTemplate } from "../email.interface";
import { TEMPLATE_PATH } from "./templates.enum";

export const EMAIL = {
    welcome: "welcome",
    warning: "warning",
    missingCatalog: "missingCatalog"
} as const;

type EmailEnum = (typeof EMAIL)[keyof typeof EMAIL];

export const EMAIL_TEMPLATE = {
    [EMAIL.welcome]: {
        subject: "Welcome!",
        templatePath: TEMPLATE_PATH.welcome
    },
    [EMAIL.warning]: {
        subject: "Notice flagged for check",
        templatePath: TEMPLATE_PATH.warning
    },
    [EMAIL.missingCatalog]: {
        subject: "Missing brand or model reported",
        templatePath: TEMPLATE_PATH.missingCatalog
    }
} as const satisfies Record<EmailEnum, IEmailTemplate>;
