/**
 * This converts the raw database aggregates to a representable format.
 *
 * @param {object} input The raw database aggregates
 * @returns {object} The standardized output payload
 */
function toAdminOverviewDTO(input) {
  const { kpis, ordersByStatusRaw, recentOrders, revenueTrendRaw } = input;

  // Normalize order statuses
  const ordersByStatus = ordersByStatusRaw.map((row) => ({
    status: row.status,
    count: Number(row.count) || 0,
  }));

  // Normalize recent orders array
  const mappedRecentOrders = recentOrders.map((row) => ({
    orderId: `ORD-${row.order_id}`,
    customerName:
      `${row.first_name || ""} ${row.last_name || ""}`.trim() || null,
    total: Number(row.total) || 0,
    status: row.order_status,
    createdAt: row.created_at,
  }));

  // Normalize revenue trend format
  const revenueTrend = revenueTrendRaw.map((row) => {
    let dateObj = row.date instanceof Date ? row.date : new Date(row.date);

    return {
      date: dateObj.toISOString().split("T")[0],
      revenue: Number(row.revenue) || 0,
    };
  });

  return {
    kpis: {
      totalRevenue: kpis.totalRevenue,
      totalOrders: kpis.totalOrders,
      newUsers: kpis.totalUsers,
      averageOrderValue: kpis.averageOrderValue,
    },
    ordersByStatus,
    recentActivity: mappedRecentOrders,
    revenueTrend,
  };
}

export { toAdminOverviewDTO };
