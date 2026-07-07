import iamService from "../services/iam/iam.service.js";
import { validateBearerToken } from "../services/iam/_access/accessValidator.js";
import { UnauthorizedError } from "../utils/errors.js";

/**
 * Authenticates the request by verifying the Bearer access token and attaching req.user.
 * @middleware
 */
async function authnMiddleware(req, res, next) {
    try {
        const header =
            req.headers[iamService.access_management.AUTH_HEADERS.AUTHORIZATION];

        let accessToken;
        try {
            accessToken = validateBearerToken(header);
        } catch {
            throw new UnauthorizedError(
                "Missing or malformed Authorization header",
            );
        }

        req.user =
            await iamService.access_management.authenticateAccessToken(
                accessToken,
            );
        next();
    } catch (err) {
        next(err);
    }
}

export default authnMiddleware;
