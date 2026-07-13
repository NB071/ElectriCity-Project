import iamService from "../services/iam/iam.service.js";

/**
 * This middleware verifies the Bearer access token and sets req.user.
 * We treat missing Authorization header (and 'optional' is true) as a guest. Otherwise, it fails with 401 'Unauthorized'.
 * @middleware
 * @param {object} [options] the options
 * @param {boolean} [options.optional=false] when true, missing Authorization header allows the request as a guest
 */
function authnMiddleware({ optional = false } = {}) {
    return async (req, _res, next) => {
        const authorizationHeader =
            req.headers[
                iamService.access_management.AUTH_HEADERS.AUTHORIZATION
            ];

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
