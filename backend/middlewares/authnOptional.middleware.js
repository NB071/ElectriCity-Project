import iamService from "../services/iam/iam.service.js";

/**
 * Authenticates the request if a Bearer token is present, but does not require one.
 * Sets req.user to the authenticated user, or null for guests / invalid tokens.
 * @middleware
 */
async function authnOptionalMiddleware(req, _res, next) {
    try {
        req.user = await iamService.access_management.authenticateAccessToken(
            req.headers[
                iamService.access_management.AUTH_HEADERS.AUTHORIZATION
            ],
        );
    } catch {
        req.user = null;
    }

    next();
}

export default authnOptionalMiddleware;
