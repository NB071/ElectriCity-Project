// Cart Service

import cartDAO from "../cartDAO.js";
import { toCartItemDTO } from "../DTOs/cartItemDTO.js";
import { getPromotionsForItem } from "../../catalog/_promotions/promotionsQuery.js";
import { NotFoundError } from "../../../utils/errors.js";

/**
 * This function loads a cart item by cart ownership and maps it to the response shape.
 * @helper_function
 * @param {number} cartId the cart id
 * @param {number} cartItemId the cart item id
 * @returns {Promise<object>} the cart item
 * @throws {NotFoundError} If the cart item is not found
 * @throws {DatabaseError} On database failures
 */
async function loadMappedItem(cartId, cartItemId) {
    const item = await cartDAO.findItemByCartAndId(cartId, cartItemId);

    if (!item) {
        throw new NotFoundError("Cart item");
    }

    const options =
        item.config_id != null
            ? await cartDAO.findOptionsByConfigIds([item.config_id])
            : [];

    const promotions = await getPromotionsForItem(item.cid);

    return toCartItemDTO(item, options, promotions);
}

export { loadMappedItem };
