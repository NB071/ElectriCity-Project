import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import iamService from "../../../services/iam/iam.service.js";

/**
 * This controller registers a new customer account.
 * @route POST /api/auth/register
 * @services_used IAM (access_management)
 */
export const register = tryCatch(async (req, res, _) => {
    const { first_name, last_name, email, password, phone_number } = req.body;
    const responseData = await iamService.access_management.register({
        firstName: first_name,
        lastName: last_name,
        email,
        password,
        phoneNumber: phone_number ?? null,
    });
    return apiResponse(res, responseData, 201);
});

/**
 * This controller authenticates credentials and returns access + refresh tokens.
 * @route POST /api/auth/login
 * @services_used IAM (access_management)
 */
export const login = tryCatch(async (req, res, _) => {
    const { email, password } = req.body;
    const responseData = await iamService.access_management.login({
        email,
        password,
    });
    return apiResponse(res, responseData, 200);
});

/**
 * This controller blocklists the current access token and revokes the refresh token chain.
 * @route POST /api/auth/logout
 * @services_used IAM (access_management)
 */
export const logout = tryCatch(async (req, res, _) => {
    await iamService.access_management.logout({
        userId: req.user.user_id,
        jti: req.user.jti,
        tokenExpiry: req.user.exp,
    });
    return apiResponse(res, { loggedOut: true }, 200);
});

/**
 * This controller exchanges a valid refresh token for a new access + refresh token pair.
 * @route POST /api/auth/refresh
 * @services_used IAM (access_management)
 */
export const refresh = tryCatch(async (req, res, _) => {
    const { refresh_token: refreshToken } = req.body;
    const responseData =
        await iamService.access_management.refreshTokens(refreshToken);
    return apiResponse(res, responseData, 200);
});
