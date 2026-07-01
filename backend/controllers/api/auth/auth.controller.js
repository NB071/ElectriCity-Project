import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import iamService from "../../../services/iam/iam.service.js";

/**
 * This controller registers a new customer account.
 * @required_role N/A
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
 * @required_role N/A
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
 * @required_role Customer/Admin
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
 * @required_role Customer/Admin
 * @route POST /api/auth/refresh
 * @services_used IAM (access_management)
 */
export const refresh = tryCatch(async (req, res, _) => {
    const { refresh_token: refreshToken } = req.body;
    const responseData =
        await iamService.access_management.refreshTokens(refreshToken);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns the authenticated user's profile for frontend caching.
 * Optional ?fields=email,first_name limits the response payload.
 * @required_role Customer/Admin
 * @route GET /api/auth/me
 * @services_used IAM (identity_management)
 */
export const getMe = tryCatch(async (req, res, _) => {
    const responseData = await iamService.identity_management.getUserById(
        req.user.user_id,
        { fields: req.query.fields },
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller updates the authenticated user's profile.
 * @required_role Customer/Admin
 * @route PATCH /api/auth/me
 * @services_used IAM (identity_management)
 */
export const updateMe = tryCatch(async (req, res, _) => {
    const {
        first_name,
        last_name,
        email,
        phone_number,
        current_password,
        new_password,
    } = req.body;

    const responseData = await iamService.identity_management.updateProfile({
        userId: req.user.user_id,
        firstName: first_name,
        lastName: last_name,
        email,
        phoneNumber: phone_number,
        currentPassword: current_password,
        newPassword: new_password,
    });
    return apiResponse(res, responseData, 200);
});

/**
 * This controller soft-deletes the authenticated user's account.
 * @required_role Customer/Admin
 * @route DELETE /api/auth/me
 * @services_used IAM (identity_management)
 */
export const deleteMe = tryCatch(async (req, res, _) => {
    const responseData = await iamService.identity_management.deleteProfile({
        userId: req.user.user_id,
    });
    return apiResponse(res, responseData, 200);
});
