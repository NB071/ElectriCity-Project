// Catalog Options
// CQRS - Query side

import optionsDAO from "./optionsDAO.js";
import { validateCatalogItemId } from "./optionsValidator.js";

/**
 * This function groups the options by category.
 * @param {object[]} rows
 * @returns {object[]}
 */
function groupOptionsByCategory(rows) {
    // map of category_id to category object
    const categories = new Map();

    // iterate over the rows and group the options by category
    for (const row of rows) {
        if (!categories.has(row.category_id)) {
            categories.set(row.category_id, {
                category_id: row.category_id,
                name: row.category_name,
                select_type: row.select_type,
                options: [],
            });
        }

        // add the option to the category
        categories.get(row.category_id).options.push({
            option_id: row.option_id,
            name: row.option_name,
            price_delta: Number(row.price_delta),
        });
    }

    // return the categories as an array
    return [...categories.values()];
}

/**
 * This function gets the options for a catalog item.
 * @param {number} cid
 * @returns {Promise<object[]>}
 * @throws {ValidationError} If the catalog item ID is invalid
 * @throws {DatabaseError} On database failures
 */
async function getForItem(cid) {
    const id = validateCatalogItemId(cid);
    const rows = await optionsDAO.findByCatalogItemId(id);
    return groupOptionsByCategory(rows);
}

export { getForItem, groupOptionsByCategory };
