/**
 * This function maps an order row to a paginated list item format.
 * @param {object} row DAO row
 * @returns {object}
 */
function toOrderListItemDTO(row) {
    return {
        order_id: row.order_id,
        order_status: row.order_status,
        payment_status: row.payment_status,
        subtotal: Number(row.subtotal),
        tax: Number(row.tax),
        total: Number(row.total),
        item_count: Number(row.item_count),
        additional_information: row.additional_information ?? null,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

export { toOrderListItemDTO };
