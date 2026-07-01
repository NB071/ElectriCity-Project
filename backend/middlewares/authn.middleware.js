function authnMiddleware(req, res, next) {
    // Use iamService.access_management.authenticateAccessToken
    // 1. Read Authorization header (AUTH_HEADERS.AUTHORIZATION)
    // 2. validateBearerToken(header) → raw access token
    // 3. authenticateAccessToken(token) → req.user
    // 4. next(err) with UnauthorizedError on failure
    next();
}

export default authnMiddleware;
