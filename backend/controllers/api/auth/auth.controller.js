import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import iamService from "../../../services/iam/iam.service.js";
import cartService from "../../../services/cart/cart.service.js";
import log from "../../../utils/logger.js";

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
        ipAddress: req.ip ?? null,
        userAgent: req.headers["user-agent"] ?? null,
    });

    // merge the guest cart into the user's cart (if a guest session is present)
    const sessionToken = req.headers[cartService.CART_HEADERS.SESSION] ?? null;

    if (sessionToken && responseData?.user?.user_id != null) {
        try {
            responseData.cart_merge = await cartService.mergeGuestCartIntoUser({
                userId: responseData.user.user_id,
                sessionToken,
            });
        } catch (err) {
            log.error("Auth", "login", "guest cart merge failed", err);
            responseData.cart_merge = {
                merged: false,
                moved_items: 0,
                error: err.message ?? "Cart merge failed.",
            };
        }
    }

    return apiResponse(res, responseData, 200);
});

/**
 * This controller revokes the current session (per-device logout).
 * @required_role Customer/Admin
 * @route POST /api/auth/logout
 * @services_used IAM (access_management)
 */
export const logout = tryCatch(async (req, res, _) => {
    await iamService.access_management.logout({
        userId: req.user.user_id,
        sid: req.user.sid,
    });
    return apiResponse(res, { loggedOut: true }, 200);
});

/**
 * This controller revokes every session for the user (sign out on all devices).
 * @required_role Customer/Admin
 * @route POST /api/auth/logout-all
 * @services_used IAM (access_management)
 */
export const logoutAll = tryCatch(async (req, res, _) => {
    await iamService.access_management.logoutAllDevices({
        userId: req.user.user_id,
    });
    return apiResponse(res, { loggedOutAllDevices: true }, 200);
});

/**
 * This controller exchanges a valid refresh token for a new access + refresh token pair.
 * @required_role Customer/Admin
 * @route POST /api/auth/refresh
 * @services_used IAM (access_management)
 */
export const refresh = tryCatch(async (req, res, _) => {
    const { refresh_token: refreshToken } = req.body;
    const responseData = await iamService.access_management.refreshTokens(
        refreshToken,
        {
            ipAddress: req.ip ?? null,
            userAgent: req.headers["user-agent"] ?? null,
        },
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns the authenticated user's active login sessions.
 * @required_role Customer/Admin
 * @route GET /api/auth/me/sessions
 * @services_used IAM (access_management)
 */
export const getMySessions = tryCatch(async (req, res, _) => {
    const responseData = await iamService.access_management.listUserSessions({
        userId: req.user.user_id,
        currentSessionId: req.user.sid,
    });
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
        currentPassword: req.body?.current_password,
    });
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns a paginated list of the authenticated user's saved addresses.
 * @required_role Customer/Admin
 * @route GET /api/auth/me/addresses
 * @services_used IAM (identity_management)
 */
export const getMyAddresses = tryCatch(async (req, res, _) => {
    const responseData = await iamService.identity_management.getUserAddresses(
        req.user.user_id,
        req.query,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns one of the authenticated user's saved addresses.
 * @required_role Customer/Admin
 * @route GET /api/auth/me/addresses/:addressId
 * @services_used IAM (identity_management)
 */
export const getMyAddress = tryCatch(async (req, res, _) => {
    const responseData = await iamService.identity_management.getUserAddress({
        userId: req.user.user_id,
        addressId: req.params.addressId,
    });
    return apiResponse(res, responseData, 200);
});

/**
 * This controller adds a new saved address for the authenticated user.
 * @required_role Customer/Admin
 * @route POST /api/auth/me/addresses
 * @services_used IAM (identity_management)
 */
export const addMyAddress = tryCatch(async (req, res, _) => {
    const { street, city, province, country, postal_code, is_default } =
        req.body;

    const responseData = await iamService.identity_management.addAddress({
        userId: req.user.user_id,
        street,
        city,
        province,
        country,
        postalCode: postal_code,
        isDefault: is_default,
    });
    return apiResponse(res, responseData, 201);
});

/**
 * This controller updates one of the authenticated user's saved addresses.
 * @required_role Customer/Admin
 * @route PATCH /api/auth/me/addresses/:addressId
 * @services_used IAM (identity_management)
 */
export const updateMyAddress = tryCatch(async (req, res, _) => {
    const { street, city, province, country, postal_code, is_default } =
        req.body;

    const responseData = await iamService.identity_management.updateAddress({
        userId: req.user.user_id,
        addressId: req.params.addressId,
        street,
        city,
        province,
        country,
        postalCode: postal_code,
        isDefault: is_default,
    });
    return apiResponse(res, responseData, 200);
});

/**
 * This controller removes one of the authenticated user's saved addresses.
 * @required_role Customer/Admin
 * @route DELETE /api/auth/me/addresses/:addressId
 * @services_used IAM (identity_management)
 */
export const deleteMyAddress = tryCatch(async (req, res, _) => {
    const responseData = await iamService.identity_management.deleteAddress({
        userId: req.user.user_id,
        addressId: req.params.addressId,
    });
    return apiResponse(res, responseData, 200);
});

/**
 * This controller marks one of the authenticated user's saved addresses as their default.
 * @required_role Customer/Admin
 * @route PATCH /api/auth/me/addresses/:addressId/default
 * @services_used IAM (identity_management)
 */
export const setDefaultMyAddress = tryCatch(async (req, res, _) => {
    const responseData = await iamService.identity_management.setDefaultAddress(
        {
            userId: req.user.user_id,
            addressId: req.params.addressId,
        },
    );
    return apiResponse(res, responseData, 200);
});
