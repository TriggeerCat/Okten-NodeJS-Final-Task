import z from "zod";

const isLuhnValid = (cardNumber: string) => {
    let sum = 0;
    for (let i = 0; i < cardNumber.length; i++) {
        let digit = Number(cardNumber[cardNumber.length - 1 - i]);
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 === 0;
};

// a card is valid until the end of its expiry month
const isNotExpired = (expiry: string) => {
    const [month, year] = expiry.split("/").map(Number);
    return new Date(2000 + year, month, 1) > new Date();
};

export class UserValidator {
    private static readonly userName = z
        .string("Username must be a string")
        .trim()
        .min(3, "Username is too short (at least 3 symbols)")
        .max(20, "Username is too long (at most 20 symbols)");
    private static readonly userEmail = z
        .string("Email must be a string")
        .trim()
        .toLowerCase()
        .pipe(z.email("Email is wrong"));
    private static readonly password = z
        .string("Password must be a string")
        .min(8, "Password is too short (at least 8 symbols)")
        .max(64, "Password is too long (at most 64 symbols)");
    private static readonly tenant = z
        .string("Tenant must be a string")
        .trim()
        .min(3, "Tenant is too short (at least 3 symbols)")
        .max(32, "Tenant is too long (at most 32 symbols)");

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

    public static readonly signIn = z.object({
        email: this.userEmail,
        password: z.string("Password must be a string").min(1, "Password is required")
    });

    public static readonly updateUser = z
        .object({
            name: this.userName,
            email: this.userEmail
        })
        .partial()
        .refine((user) => Object.keys(user).length > 0, "Nothing to update");

    public static readonly tenantRequest = z.object({
        tenant: this.tenant
    });

    public static readonly email = z.object({
        email: this.userEmail
    });

    // dummy payment, card data is only validated and never stored
    public static readonly purchasePremium = z.object({
        cardHolder: z
            .string("Card holder must be a string")
            .trim()
            .min(2, "Card holder is too short")
            .max(60, "Card holder is too long"),
        cardNumber: z
            .string("Card number must be a string")
            .transform((value) => value.replace(/[\s-]/g, ""))
            .pipe(
                z
                    .string()
                    .regex(/^\d{16}$/, "Card number must have 16 digits")
                    .refine(isLuhnValid, "Card number is invalid")
            ),
        expiry: z
            .string("Expiry must be a string")
            .trim()
            .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format")
            .refine(isNotExpired, "Card is expired"),
        cvv: z.string("CVV must be a string").regex(/^\d{3}$/, "CVV must have 3 digits")
    });
}
