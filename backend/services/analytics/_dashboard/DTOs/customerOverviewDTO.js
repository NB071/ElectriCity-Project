/**
 * This converts the raw database aggregates to a representable format.
 *
 * @param {object} input The raw database aggregates
 * @returns {object} The standardized output payload
 */
function toCustomerOverviewDTO(input) {
  const { kpis, recentOrders } = input;

  const mappedRecentOrders = recentOrders.map((row) => ({
    orderId: `ORD-${row.order_id}`,
    total: Number(row.total) || 0,
    status: row.order_status,
    itemCount: Number(row.itemCount) || 0,
    createdAt: row.created_at,
  }));

  return {
    accountSummary: {
      status: kpis.accountStatus,
      memberSince: kpis.memberSince,
      totalAmountSpent: kpis.totalAmountSpent,
    },
    orderStats: {
      totalOrders: kpis.totalOrders,
      activeOrders: kpis.activeOrders,
      completedOrders: kpis.completedOrders,
    },
    wishlistStats: {
      itemCount: kpis.wishlistItemCount,
    },
    recentOrders: mappedRecentOrders,
  };
}

export { toCustomerOverviewDTO };
