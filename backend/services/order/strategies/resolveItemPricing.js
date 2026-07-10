// Order Service
// Shared helper: resolves checkout line items to a frozen unit_price

import productDAO from "../../catalog/_product/productDAO.js";
import configurationsDAO from "../../catalog/_configurations/configurationsDAO.js";
import { ValidationError } from "../../../utils/errors.js";

/**
 * This function resolves a single checkout line item's unit_price from the catalog/configuration.
 * @param {object} item
 * @param {number} item.cid
 * @param {number|null} [item.config_id]
 * @param {number} item.quantity
 * @returns {Promise<{ cid: number, config_id: number|null, quantity: number, unit_price: number }>}
 * @throws {NotFoundError} If the catalog item or configuration does not exist
 * @throws {ValidationError} If the configuration does not belong to the catalog item
 */
async function resolveItemPricing({ cid, config_id = null, quantity }) {
    const catalogItem = await productDAO.findBaseById(cid);

    if (config_id == null) {
        return {
            cid,
            config_id: null,
            quantity,
            unit_price: Number(catalogItem.base_price),
        };
    }

    const configuration = await configurationsDAO.findById(config_id);

    if (Number(configuration.cid) !== Number(cid)) {
        throw new ValidationError(
            `config_id ${config_id} does not belong to cid ${cid}.`,
        );
    }

    return {
        cid,
        config_id,
        quantity,
        unit_price: Number(configuration.total_price),
    };
}

/**
 * This function resolves pricing for a list of checkout line items.
 * @param {object[]} items
 * @returns {Promise<object[]>}
 * @throws {NotFoundError} If a catalog item or configuration does not exist
 * @throws {ValidationError} If a configuration does not belong to its catalog item
 */
async function resolveItemsPricing(items) {
    return Promise.all(items.map(resolveItemPricing));
}

export { resolveItemPricing, resolveItemsPricing };
