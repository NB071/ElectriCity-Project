import authzMiddleware from "./authz.middleware.js";

/**
 * This middleware authorizes only when the request is authenticated.
 * Guests (no req.user) pass through; authenticated users must match allowedRoles.
 * This middleware must be used after authnMiddleware({ optional: true }).
 * @middleware
 * @used_by Cart routes
 * @param {...string} allowedRoles the allowed roles
 */
function authzIfAuthenticatedMiddleware(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next();
        }
        return authzMiddleware(...allowedRoles)(req, res, next);
    };
}

export default authzIfAuthenticatedMiddleware;
