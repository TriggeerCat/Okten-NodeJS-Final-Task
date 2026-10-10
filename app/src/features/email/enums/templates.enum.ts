import path from "node:path";

const genPath = (filename: string) =>
    path.join(process.cwd(), "src", "models", "email", "enums", "templates", `${filename}.hbs`);

export const TEMPLATE_PATH = {
    index: genPath("index"),
    warning: genPath("warning"),
    welcome: genPath("welcome")
} as const;
