import path from "node:path";

// Templates are read from src at runtime, so the app has to be started from the app directory
export const TEMPLATES_DIR = path.join(process.cwd(), "src", "features", "email", "enums", "templates");

const genPath = (filename: string) => path.join(TEMPLATES_DIR, `${filename}.hbs`);

export const TEMPLATE_PATH = {
    index: genPath("index"),
    warning: genPath("warning"),
    welcome: genPath("welcome"),
    missingCatalog: genPath("missing-catalog")
} as const;

export const TEMPLATE_STYLE_PATH = path.join(TEMPLATES_DIR, "styles", "email.style.css");
