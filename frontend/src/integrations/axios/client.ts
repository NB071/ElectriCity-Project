// This file is intended to be a replacement for the axios client used in the backend.
// inspired by: https://github.com/bezkoder/react-refresh-token-hooks/blob/master/src/services/api.js
import { getApiBaseUrl } from "@/lib/env";

import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { AUTH_PATHS, CART_HEADERS } from "./constants";
import { session } from "./session";
import { ApiError, type ApiErrorBody, type ApiResponse } from "./types";
import { handleSessionExpiry, markAsGuest } from "@/lib/auth";

type RetryConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

function resolveBaseUrl(): string {
    return getApiBaseUrl();
}

// This function reads the cart session header from the response headers.
function readCartSessionHeader(headers: AxiosResponse["headers"]): string | null {
    const value = headers?.[CART_HEADERS.SESSION] ?? headers?.["X-Cart-Session"];
    if (typeof value === "string" && value.length > 0) return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    return null;
}

// This function converts an axios error to an ApiError.
function toApiError(error: AxiosError<ApiResponse<ApiErrorBody>>): ApiError {
    const status = error.response?.status ?? 0;
    const body = error.response?.data?.data;

    if (body && typeof body === "object" && "message" in body) {
        return new ApiError(body.message ?? error.message, {
            status,
            code: body.code,
            details: body.details,
            sentryEventId: body.sentry_event_id,
        });
    }

    return new ApiError(error.message || "Request failed", { status });
}

// Create a new axios instance with the base URL and credentials.
const apiClient: AxiosInstance = axios.create({
    baseURL: resolveBaseUrl(),
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Auth uses httpOnly cookies (withCredentials). This interceptor only attaches the guest cart session.
// ref: https://axios.rest/pages/advanced/interceptors
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const cartSession = session.cart.get();
    if (cartSession) {
        config.headers.set(CART_HEADERS.SESSION, cartSession);
    }

    return config;
});

// Single-flight refresh of the httpOnly access cookie.
let refreshPromise: Promise<void> | null = null;

// This function refreshes the access token.
async function refreshAccessToken(): Promise<void> {
    await axios.post(
        `${resolveBaseUrl()}${AUTH_PATHS.REFRESH}`,
        {},
        {
            withCredentials: true,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        }
    );
}

// This interceptor is used to handle the response from the server.
// ref: https://axios.rest/pages/advanced/interceptors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        const requestUrl = response.config.url ?? "";

        // Login merges guest cart server-side and clears the cart_session cookie.
        if (requestUrl.includes(AUTH_PATHS.LOGIN)) {
            session.cart.clear();
        }

        const sessionFromHeader = readCartSessionHeader(response.headers);
        if (sessionFromHeader) {
            session.cart.set(sessionFromHeader);
        }

        const payload = response.data as ApiResponse<unknown> | undefined;
        const body = payload && typeof payload === "object" && "data" in payload ? payload.data : null;

        if (body && typeof body === "object") {
            const cart = body as { session_token?: unknown; is_guest?: unknown };
            if (typeof cart.session_token === "string" && cart.session_token.length > 0) {
                session.cart.set(cart.session_token);
            } else if (cart.is_guest === false) {
                session.cart.clear();
            }
        }

        return response;
    },
    async (error: AxiosError<ApiResponse<ApiErrorBody>>) => {
        const original = error.config as RetryConfig | undefined;
        const status = error.response?.status;
        const url = original?.url ?? "";

        const isAuthRefreshCall = url.includes(AUTH_PATHS.REFRESH);
        const isLoginCall = url.includes(AUTH_PATHS.LOGIN);
        const requestPath = url.split("?")[0] ?? "";
        const isMeCall = requestPath === AUTH_PATHS.ME || requestPath.endsWith(AUTH_PATHS.ME);

        if (status === 401 && original && !original._retry && !isAuthRefreshCall && !isLoginCall) {
            original._retry = true;

            try {
                refreshPromise ??= refreshAccessToken().finally(() => {
                    refreshPromise = null;
                });
                await refreshPromise;
                return apiClient.request(original);
            } catch {
                // /me 401 + failed refresh = guest (or fully expired). Public pages stay put.
                if (isMeCall) {
                    markAsGuest();
                } else {
                    handleSessionExpiry();
                }
                throw toApiError(error);
            }
        }

        if (status === 401 && isAuthRefreshCall) {
            handleSessionExpiry();
        }

        throw toApiError(error);
    }
);

// This function is used to make a GET request to the server.
async function apiGet<T>(url: string, config?: Parameters<AxiosInstance["get"]>[1]): Promise<T> {
    const { data } = await apiClient.get<ApiResponse<T>>(url, config);
    return data.data as T;
}

// This function is used to make a POST request to the server.
async function apiPost<T>(url: string, body?: unknown, config?: Parameters<AxiosInstance["post"]>[2]): Promise<T> {
    const { data } = await apiClient.post<ApiResponse<T>>(url, body, config);
    return data.data as T;
}

// This function is used to make a PATCH request to the server.
async function apiPatch<T>(url: string, body?: unknown, config?: Parameters<AxiosInstance["patch"]>[2]): Promise<T> {
    const { data } = await apiClient.patch<ApiResponse<T>>(url, body, config);
    return data.data as T;
}

// This function is used to make a DELETE request to the server.
async function apiDelete<T>(url: string, config?: Parameters<AxiosInstance["delete"]>[1]): Promise<T> {
    const { data } = await apiClient.delete<ApiResponse<T>>(url, config);
    return data.data as T;
}

export { apiGet, apiPost, apiPatch, apiDelete, apiClient };
