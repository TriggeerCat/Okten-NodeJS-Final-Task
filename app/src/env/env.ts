import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
    // DB CONFIG
    MONGO_URI: z.url().optional().default(""),

    // SERVER CONFIG
    SERVER_PORT: z.coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .optional()
        .default(12250),

    // FRONTEND
    FRONTEND_URL: z.url().optional().default("localhost:5173")
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error(
        "Environment variables validation failure:",
        z.treeifyError(env.error)
    );
    throw new Error("Invalid environment variables");
}

const envData = env.data;

export default envData;