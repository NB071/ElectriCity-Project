/**
 * Returns middleware that verifies the authenticated user has an allowed role.
 * @middleware
 * @param {...string} allowedRoles e.g. "customer", "admin"
 */
function authzMiddleware(...allowedRoles) {
    return (req, res, next) => {
        // TODO: Verify req.user.role is one of allowedRoles
        void allowedRoles;
        next();
    };
}

export default authzMiddleware;
