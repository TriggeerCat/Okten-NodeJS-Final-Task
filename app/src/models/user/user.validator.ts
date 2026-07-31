import z from "zod";

export class UserValidator {
    private static readonly userName = z.string().trim().min(3).max(10);
    private static readonly userEmail = z.email();
    private static readonly password = z.string().trim().min(8).max(16);
    private static readonly tenant = z.string().trim().min(3).max(32);

    public static readonly createUser = z.object({
        name: this.userName,
        email: this.userEmail,
        password: this.password
    });

    public static readonly createUserDealer = z.object({
        name: this.userName,
        email: this.userEmail,
        password: this.password,
        tenant: this.tenant
    });

    public static readonly updateUser = z.object({
        name: this.userName,
        email: this.userEmail
    });

    public static readonly email = z.object({
        email: this.userEmail
    });
}
