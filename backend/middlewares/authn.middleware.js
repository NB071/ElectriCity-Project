import iamService from "../services/iam/iam.service.js";

/**
 * This middleware verifies the access token
 * Cookies are httpOnly and only sent to the server.
 * Authorization header is for API tools.
 * We treat a missing token (and 'optional' is true) as a guest. Otherwise, it fails with 401 'Unauthorized'.
 * @middleware
 * @param {object} [options] the options
 * @param {boolean} [options.optional=false] when true, a missing token allows the request as a guest
 */
function authnMiddleware({ optional = false } = {}) {
    return async (req, _res, next) => {
        const { AUTH_HEADERS, AUTH_COOKIES } = iamService.access_management;

        const cookieToken = req.cookies?.[AUTH_COOKIES.ACCESS_TOKEN];
        const authorizationHeader = cookieToken
            ? `${AUTH_HEADERS.BEARER_PREFIX}${cookieToken}`
            : req.headers[AUTH_HEADERS.AUTHORIZATION];

        if (
            optional &&
            (authorizationHeader == null || authorizationHeader === "")
        ) {
            req.user = null;
            return next();
        }

        try {
            req.user =
                await iamService.access_management.authenticateAccessToken(
                    authorizationHeader,
                );
            next();
        } catch (err) {
            next(err);
        }
    };
}

export default authnMiddleware;
