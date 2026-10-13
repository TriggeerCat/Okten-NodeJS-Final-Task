import z from "zod";

export const paginationQuery = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20)
});

export type IPaginationQuery = z.infer<typeof paginationQuery>;

export interface IPaginated<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
}

export const toSkip = ({ page, limit }: IPaginationQuery) => (page - 1) * limit;
