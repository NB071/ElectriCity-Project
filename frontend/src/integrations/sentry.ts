/*
    Browser Sentry initialization for the ElectriCity frontend.

    API 5xx failures are already reported by the Express backend. This covers
    React render crashes, unhandled promise rejections, and other client-side errors.
*/

import * as Sentry from "@sentry/react";
import type { AnyRouter } from "@tanstack/react-router";
import { env, getSentryTracesSampleRate } from "@/lib/env";

export const SENTRY_RELEASE = `electricity-frontend@${env.VITE_VERSION}`;

const SENSITIVE_KEY_PATTERN = /card|cvv|cvc|pan|payment|stripe|token|password|secret|authorization|email|phone|address|billing|cookie/i;

function scrubSensitive(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(scrubSensitive);
    }

    if (!value || typeof value !== "object") {
        return value;
    }

    const cleaned: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        cleaned[key] = SENSITIVE_KEY_PATTERN.test(key) ? "[Filtered]" : scrubSensitive(nested);
    }
    return cleaned;
}

function beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
    if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        if (event.request.headers) {
            for (const header of Object.keys(event.request.headers)) {
                if (SENSITIVE_KEY_PATTERN.test(header)) {
                    event.request.headers[header] = "[Filtered]";
                }
            }
        }
    }

    if (event.extra) {
        event.extra = scrubSensitive(event.extra) as typeof event.extra;
    }

    if (event.contexts) {
        event.contexts = scrubSensitive(event.contexts) as typeof event.contexts;
    }

    return event;
}

let initialized = false;

/**
 * Initialize Sentry after the TanStack Router instance exists so route navigations
 * become performance spans.
 */
export function initSentry(router: AnyRouter): void {
    if (initialized) return;
    initialized = true;

    const sentryEnabled = env.VITE_SENTRY_ENABLED && Boolean(env.VITE_SENTRY_DSN);

    Sentry.init({
        dsn: env.VITE_SENTRY_DSN || undefined,
        enabled: sentryEnabled,
        environment: env.VITE_ENVIRONMENT,
        release: SENTRY_RELEASE,
        tracesSampleRate: getSentryTracesSampleRate(),
        beforeSend,
        integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
        ignoreErrors: [
            "ResizeObserver loop limit exceeded",
            "ResizeObserver loop completed with undelivered notifications",
            /Non-Error promise rejection captured/i,
            /Loading chunk [\d]+ failed/i,
            /ChunkLoadError/i,
            /Failed to fetch dynamically imported module/i,
            /Importing a module script failed/i,
        ],
        denyUrls: [/extensions\//i, /^chrome:\/\//i, /^chrome-extension:\/\//i, /^moz-extension:\/\//i],
        dataCollection: {
            userInfo: false,
            httpBodies: [],
            httpHeaders: {
                request: {
                    deny: ["authorization", "cookie", "set-cookie", "forwarded", "-ip", "remote-", "via", "-user", "payment"],
                },
                response: {
                    deny: ["set-cookie", "authorization", "payment"],
                },
            },
            urlQueryParams: {
                deny: ["forwarded", "-ip", "remote-", "via", "-user", "card", "cvv", "cvc", "pan", "token", "payment", "password", "secret"],
            },
            cookies: {
                deny: ["session", "refresh", "token", "auth", "jwt", "access_token", "refresh_token"],
            },
            genAI: {
                inputs: false,
                outputs: false,
            },
        },
    });
}

/** Bind only the stable user id. Never send email or other PII. */
export function setSentryUser(userId: number | string | null | undefined): void {
    if (userId == null) {
        Sentry.setUser(null);
        return;
    }
    Sentry.setUser({ id: String(userId) });
}

export function clearSentryUser(): void {
    Sentry.setUser(null);
}

export { Sentry };
