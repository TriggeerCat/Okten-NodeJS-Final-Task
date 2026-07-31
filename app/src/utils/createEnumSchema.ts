import z from "zod";

export const createEnumSchema = <T extends Record<string, string>>(obj: T, errorMessage?: string) =>
    z.enum(Object.values(obj) as [T[keyof T], ...T[keyof T][]], errorMessage);
