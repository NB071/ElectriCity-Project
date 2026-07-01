import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import iamService from "../../../services/iam/iam.service.js";

/**
 * This controller returns a paginated list of all platform users.
 * @route GET /api/dashboard/admin/users
 * @required_role admin
 * @services_used IAM (identity_management)
 */
export const getAllUsers = tryCatch(async (req, res, _) => {
    const responseData = await iamService.identity_management.viewAllUsers(
        req.query,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller searches platform users by name, email, phone, created date, or deleted status.
 * @route GET /api/dashboard/admin/users/search
 * @required_role admin
 * @services_used IAM (identity_management)
 */
export const searchUsers = tryCatch(async (req, res, _) => {
    const responseData = await iamService.identity_management.searchUsers(
        req.query,
    );
    return apiResponse(res, responseData, 200);
});
