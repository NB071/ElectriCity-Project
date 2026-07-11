/*
    This file contains the Sentry SDK initialization configuration.

    Resource(s): 
    - https://docs.sentry.io/platforms/javascript/guides/express/
    - https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
*/

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import env from "./env.js";
import APP_CONSTANTS from "./constants.js";
import { beforeSend } from "../utils/sentryHelpers.js";

Sentry.init({
    dsn: env.sentry.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: env.sentry.SENTRY_TRACES_SAMPLE_RATE,
    profileSessionSampleRate: env.sentry.SENTRY_PROFILE_SESSION_SAMPLE_RATE,
    profileLifecycle: "trace",
    enabled: env.sentry.SENTRY_ENABLED,
    serverName: `${APP_CONSTANTS.APP.APP_NAME}@${APP_CONSTANTS.APP.APP_VERSION}`,
    environment: env.app.NODE_ENV,
    beforeSend,

    dataCollection: {
        userInfo: false,
        httpBodies: [],
        httpHeaders: {
            deny: [
                "authorization",
                "cookie",
                "set-cookie",
                "forwarded",
                "-ip",
                "remote-",
                "via",
                "-user",
                "payment",
            ],
        },
        queryParams: {
            deny: [
                "forwarded",
                "-ip",
                "remote-",
                "via",
                "-user",
                "card",
                "cvv",
                "cvc",
                "pan",
                "token",
                "payment",
            ],
        },
        cookies: {
            deny: ["session", "refresh", "token", "auth", "jwt"],
        },
        genAI: {
            inputs: false,
            outputs: false,
        },
    },
});
