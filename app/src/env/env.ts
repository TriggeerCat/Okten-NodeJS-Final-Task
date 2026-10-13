import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
    // DB
    MONGO_URI: z.url(),

    // SERVER
    PORT: z.coerce.number().int().min(1).max(65535).optional().default(12250),
    // number of reverse proxies in front of the app (1 behind nginx), needed for correct client IPs
    TRUST_PROXY: z.coerce.number().int().min(0).optional().default(0),

    // FRONTEND
    FRONTEND_URL: z.url().optional().default("http://localhost:5173"),

    // TOKEN (lifetimes in milliseconds)
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    JWT_ACCESS_LIFETIME: z.coerce.number().int().positive(),
    JWT_REFRESH_LIFETIME: z.coerce.number().int().positive(),

    // EMAIL
    EMAIL_USERNAME: z.email(),
    EMAIL_PASSWORD: z.string()
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error("Environment variables validation failure:", z.treeifyError(env.error));
    throw new Error("Invalid environment variables");
}

const envData = env.data;

export default envData;
