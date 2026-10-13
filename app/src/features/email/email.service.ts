import { readFile } from "node:fs/promises";
import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";
import envData from "../../env/env";
import { IEmailTemplate } from "./email.interface";
import { TEMPLATE_PATH, TEMPLATE_STYLE_PATH } from "./enums/templates.enum";
import juice from "juice";

class EmailService {
    private readonly transporter: Transporter;
    private readonly templateCache = new Map<string, ReturnType<typeof handlebars.compile>>();
    private styles: string | null = null;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: envData.EMAIL_USERNAME,
                pass: envData.EMAIL_PASSWORD
            }
        });
    }

    private async getTemplate(templatePath: string) {
        let template = this.templateCache.get(templatePath);
        if (!template) {
            template = handlebars.compile(await readFile(templatePath, "utf-8"));
            this.templateCache.set(templatePath, template);
        }
        return template;
    }

    private async renderTemplate(templatePath: string, context: Record<string, any>) {
        this.styles ??= await readFile(TEMPLATE_STYLE_PATH, "utf-8");
        const index = await this.getTemplate(TEMPLATE_PATH.index);
        const child = await this.getTemplate(templatePath);
        const body = juice(child(context), { extraCss: this.styles });
        return index({ ...context, body });
    }

    public async sendEmail(to: string | string[], emailTemplate: IEmailTemplate, context: Record<string, any>) {
        await this.transporter.sendMail({
            from: envData.EMAIL_USERNAME,
            to,
            subject: emailTemplate.subject,
            html: await this.renderTemplate(emailTemplate.templatePath, context)
        });
    }

    // For notifications that must not fail the request that triggered them
    public sendEmailInBackground(to: string | string[], emailTemplate: IEmailTemplate, context: Record<string, any>) {
        if (Array.isArray(to) && !to.length) return;
        this.sendEmail(to, emailTemplate, context).catch((e) =>
            console.error(`Failed to send "${emailTemplate.subject}" email:`, e)
        );
    }
}

export const emailService = new EmailService();
