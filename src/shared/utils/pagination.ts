export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/** Converts page/limit into Prisma `skip`/`take`. */
export function getPaginationArgs(
    page: number,
    limit: number
): { skip: number; take: number } {
    return { skip: (page - 1) * limit, take: limit };
}

export function buildPaginationMeta(
    total: number,
    page: number,
    limit: number
): PaginationMeta {
    return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
