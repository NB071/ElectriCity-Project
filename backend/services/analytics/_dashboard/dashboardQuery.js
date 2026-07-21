// Analytics/Dashboard Service
// CQRS - Query side (Dashboard)

import dashboardDAO from "./dashboardDAO.js";
import log from "../../../utils/logger.js";
import { toAdminOverviewDTO } from "./DTOs/adminOverviewDTO.js";
import { toCustomerOverviewDTO } from "./DTOs/customerOverviewDTO.js";

/**
 * This method fetches all the required metrics for the Admin Dashboard overview.
 * @returns {Promise<object>} The fully assembled Admin dashboard JSON object.
 */
async function getAdminOverview() {
  try {
    const [kpis, ordersByStatusRaw, recentOrders, revenueTrendRaw] =
      await Promise.all([
        dashboardDAO.getAdminKPIs(),
        dashboardDAO.getOrdersByStatus(),
        dashboardDAO.getRecentOrders(5),
        dashboardDAO.getRevenueTrend(),
      ]);

    return toAdminOverviewDTO({
      kpis,
      ordersByStatusRaw,
      recentOrders,
      revenueTrendRaw,
    });
  } catch (err) {
    log.error(
      "Analytics (Dashboard)",
      "getAdminOverview",
      "Dashboard overview fetch failed",
      err,
    );
    throw err;
  }
}

/**
 * This method fetches all the required metrics for the Customer Dashboard overview.
 * @param {number|string} userId - The authenticated user ID.
 * @returns {Promise<object>} The fully assembled Customer dashboard JSON object.
 */
async function getCustomerOverview(userId) {
  try {
    if (!userId) {
      throw new Error("userId is strictly required.");
    }

    const [kpis, recentOrders] = await Promise.all([
      dashboardDAO.getCustomerKPIs(userId),
      dashboardDAO.getRecentOrdersByUser(userId, 5),
    ]);

    return toCustomerOverviewDTO({ kpis, recentOrders });
  } catch (err) {
    log.error(
      "Analytics (Dashboard)",
      "getCustomerOverview",
      "Customer dashboard overview fetch failed",
      err,
    );
    throw err;
  }
}

export { getAdminOverview, getCustomerOverview };
