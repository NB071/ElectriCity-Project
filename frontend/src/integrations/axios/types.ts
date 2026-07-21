export type ApiSuccessResponse<T> = {
    success: true;
    status: string;
    data: T;
    timestamp: string;
};

export type ApiErrorBody = {
    message: string;
    code: string;
    details: unknown;
    stack: string | null;
    sentry_event_id: string | null;
};

export type ApiErrorResponse = {
    success: false;
    status: string;
    data: ApiErrorBody;
    timestamp: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details: unknown;
    readonly sentryEventId: string | null;

    constructor(
        message: string,
        options: {
            status: number;
            code?: string;
            details?: unknown;
            sentryEventId?: string | null;
        }
    ) {
        super(message);
        this.name = "ApiError";
        this.status = options.status;
        this.code = options.code ?? "INTERNAL_ERROR";
        this.details = options.details ?? null;
        this.sentryEventId = options.sentryEventId ?? null;
    }
}
