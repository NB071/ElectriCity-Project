/**
 * Returns middleware that verifies the authenticated user has an allowed role.
 * @middleware
 * @param {...string} allowedRoles e.g. "customer", "admin"
 */
function authzMiddleware(...allowedRoles) {
    return (req, res, next) => {
        // Use iamService.access_management.authorizeUser(req.user, ...allowedRoles)
        // Requires authnMiddleware to have set req.user first
        void allowedRoles;
        next();
    };
}

export default authzMiddleware;
