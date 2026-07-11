// Library: helmet
// Docs: https://helmetjs.github.io/

/*
 * This middleware is responsible for setting standard HTTP security headers on all responses.
 * CORP is cross-origin so our frontend can load /media assets (pdfs/images).
 */

import helmet from "helmet";

const helmetMiddleware = helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
});

export default helmetMiddleware;
