export const STATUS_CODES = {
    ok: 200,
    created: 201,
    no_content: 204,
    bad_request: 400,
    unauthorized: 401,
    payment_required: 402,
    forbidden: 403,
    not_found: 404,
    conflict: 409,
    too_many_requests: 429,
    internal_server_error: 500,
    bad_gateway: 502
} as const;
