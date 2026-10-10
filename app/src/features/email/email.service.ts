import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";
import envData from "../../env/env";
import { IEmailTemplate } from "./email.interface";
import { TEMPLATE_PATH } from "./enums/templates.enum";
import juice from "juice";
import path from "node:path";

class EmailService {
    private readonly transporter: Transporter;
    private readonly templateStylePath = path.join(
        process.cwd(),
        "src",
        "models",
        "email",
        "enums",
        "templates",
        "styles",
        "email.style.css"
    );

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: envData.EMAIL_USERNAME,
                pass: envData.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    private async renderTemplate(templatePath: string, context: Record<string, any>) {
        const index = handlebars.compile(TEMPLATE_PATH.index);
        const child = handlebars.compile(templatePath);
        const body = juice(child(context), { extraCss: this.templateStylePath });
        return index({ ...context, body });
    }

    public async sendEmail(to: string, emailTemplate: IEmailTemplate, context: Record<string, any>) {
        await this.transporter.sendMail({
            to,
            subject: emailTemplate.subject,
            html: await this.renderTemplate(emailTemplate.templatePath, context)
        });
    }
}

export const emailService = new EmailService();
