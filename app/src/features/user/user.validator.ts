import z from "zod";

export class UserValidator {
    private static readonly userName = z
        .string("Description must be a string")
        .trim()
        .min(3, "Username is too short (at least 3 symbols)")
        .max(20, "Username is too long (at most 20 symbols)");
    private static readonly userEmail = z.email("Email is wrong");
    private static readonly password = z.string("Description must be a string").trim().min(8).max(16);
    private static readonly tenant = z
        .string("Description must be a string")
        .trim()
        .min(3, "Description is too short (at least 3 symbols)")
        .max(32, "Description is too long (at most 32 symbols)");

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
