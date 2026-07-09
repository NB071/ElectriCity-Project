import iamService from "../services/iam/iam.service.js";

/**
 * Authenticates the request by verifying the Bearer access token and attaching req.user.
 * @middleware
 */
async function authnMiddleware(req, _res, next) {
    try {
        req.user = await iamService.access_management.authenticateAccessToken(
            req.headers[
                iamService.access_management.AUTH_HEADERS.AUTHORIZATION
            ],
        );
        next();
    } catch (err) {
        next(err);
    }
}

export default authnMiddleware;
