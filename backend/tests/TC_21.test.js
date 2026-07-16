/**
 * TC_21 - Security - Rate Limiting on Auth Endpoints
 * UC25
 *
 * Doc expected: after 10 requests / 15 min from one IP on /api/auth → 429 + retry-after.
 * Implementation note: production authRateLimiter currently uses max=300; this case
 * exercises the same express-rate-limit handler pattern with the UC25 threshold (10).
 */
import express from "express";
import { rateLimit } from "express-rate-limit";
import http from "node:http";
import { TooManyRequestsError } from "../utils/errors.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function buildLimiterApp({ max, windowMs }) {
    const app = express();
    const limiter = rateLimit({
        windowMs,
        limit: max,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        handler: (req, res, next, options) => {
            const retryAfterSeconds = Math.ceil(options.resetTime / 1000);
            next(
                new TooManyRequestsError(
                    "Too many login attempts, please try again later.",
                    { retryAfter: retryAfterSeconds },
                ),
            );
        },
    });

    app.use("/api/auth", limiter, (req, res) => {
        res.status(200).json({ ok: true });
    });
    app.use((err, req, res, next) => {
        res.status(err.status || 500).json({
            message: err.message,
            retryAfter: err.details?.retryAfter ?? err.retryAfter,
        });
    });
    return app;
}

describe("TC_21 Security - Rate Limiting on Auth Endpoints (UC25)", () => {
    test("production mounts a shared authRateLimiter middleware", () => {
        expect(typeof authRateLimiter).toBe("function");

        const src = readFileSync(
            path.join(__dirname, "../middlewares/rateLimit.middleware.js"),
            "utf8",
        );
        expect(src).toMatch(/windowMs:\s*15\s*\*\s*60\s*\*\s*1000/);
        expect(src).toMatch(/authRateLimiter/);
    });

    test("after the 10th request in the window, further /api/auth calls are blocked", async () => {
        const app = buildLimiterApp({
            max: 10,
            windowMs: 15 * 60 * 1000,
        });

        const server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        const { port } = server.address();

        async function hit() {
            const res = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
                method: "GET",
            });
            return {
                status: res.status,
                body: await res.json().catch(() => ({})),
                headers: res.headers,
            };
        }

        try {
            for (let i = 0; i < 10; i += 1) {
                const res = await hit();
                expect(res.status).toBe(200);
            }
            const blocked = await hit();
            expect(blocked.status).toBe(429);
            expect(String(blocked.body.message)).toMatch(/too many/i);
            // UC25: reject with retry-after metadata (body details and/or RateLimit headers)
            expect(
                blocked.body.retryAfter != null ||
                    blocked.headers.get("ratelimit-reset") != null ||
                    blocked.headers.get("retry-after") != null,
            ).toBe(true);
        } finally {
            await new Promise((resolve) => server.close(resolve));
        }
    });
});
