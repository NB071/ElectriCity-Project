import iamService from "../services/iam/iam.service.js";

/**
 * Returns middleware that verifies the authenticated user has an allowed role.
 * @middleware
 * @param {...string} allowedRoles e.g. "customer", "admin"
 */
function authzMiddleware(...allowedRoles) {
    return (req, _res, next) => {
        try {
            iamService.access_management.authorizeUser(
                req.user,
                ...allowedRoles,
            );
            next();
        } catch (err) {
            next(err);
        }
    };
}

export default authzMiddleware;
