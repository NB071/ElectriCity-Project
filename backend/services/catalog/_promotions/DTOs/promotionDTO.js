/**
 * @param {object} row
 * @returns {object}
 */
function toPromotionDTO(row) {
    return {
        promo_id: row.promo_id,
        name: row.name,
        description: row.description ?? null,
        discount_amount: Number(row.discount_amount),
    };
}

export { toPromotionDTO };
