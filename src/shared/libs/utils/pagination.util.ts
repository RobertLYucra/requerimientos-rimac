export interface PaginationMetadata {
    total: number;
    page: number;
    perPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    to: number;
    from: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMetadata;
}


export function PaginationUtil(
    total: number,
    page: number,
    perPage: number,
): PaginationMetadata {
    const totalPages = Math.ceil(total / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    return {
        total,
        page,
        perPage,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        to,
        from: total > 0 ? from : 0,
    };
}