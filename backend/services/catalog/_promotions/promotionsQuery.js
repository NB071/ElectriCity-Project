// Catalog Promotions
// CQRS - Query side

import promotionsDAO from "./promotionsDAO.js";
import promoStrategyRegistry from "./strategies/PromoStrategyRegistry.js";
import { validateCatalogItemId } from "../_options/optionsValidator.js";
import { toPromotionDTO } from "./DTOs/promotionDTO.js";

/**
 * This function groups promotions by catalog item ID.
 * @helper_function
 * @private
 * @param {object[]} rows List rows
 * @returns {Map<number, object[]>}
 */
function groupPromotionsByCid(rows) {
    const grouped = new Map();

    for (const row of rows) {
        const cid = row.cid;
        const promotions = grouped.get(cid) ?? [];
        promotions.push(toPromotionDTO(row));
        grouped.set(cid, promotions);
    }

    return grouped;
}

/**
 * This function fetches promotions for a given catalog item.
 * @param {number} cid
 * @returns {Promise<object[]>} Empty when the item has no linked promotions
 * @throws {ValidationError} If the catalog item ID is invalid
 * @throws {DatabaseError} On database failures
 */
async function getPromotionsForItem(cid) {
    const id = validateCatalogItemId(cid);
    const rows = await promotionsDAO.findByCatalogItemId(id);
    return rows.map(toPromotionDTO);
}

/**
 * This function fetches promotions for multiple catalog items.
 * @param {number[]} cids
 * @returns {Promise<Map<number, object[]>>}
 * @throws {DatabaseError} On database failures
 */
async function getPromotionsForItems(cids) {
    const uniqueCids = [...new Set(cids.map(Number))].filter(Boolean);

    if (!uniqueCids.length) {
        return new Map();
    }

    const rows = await promotionsDAO.findByCatalogItemIds(uniqueCids);
    return groupPromotionsByCid(rows);
}

/**
 * Resolves a validated promo type to a browse-filter SQL fragment.
 * @param {string} promoType
 * @returns {{ sql: string, params: unknown[] }}
 * @throws {ValidationError} If the promo type is invalid
 */
function getBrowseFilterForPromoType(promoType) {
    return promoStrategyRegistry.getPromoFragment(promoType);
}

export {
    getPromotionsForItem,
    getPromotionsForItems,
    getBrowseFilterForPromoType,
};
