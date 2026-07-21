import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import analyticsService from "../../../services/analytics/analytics.service.js";

/**
 * This controller fetches the overview KPIs for the customer dashboard.
 * @route GET /api/dashboard/customer/analytics/overview
 * @required_role customer
 * @services_used Analytics
 */
export const getOverview = tryCatch(async (req, res, _) => {
  const userId = req.user.user_id;
  const responseData = await analyticsService.getCustomerOverview(userId);
  return apiResponse(res, responseData, 200);
});
