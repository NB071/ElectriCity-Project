// Order Service
// Strategy pattern / customer (and guest) checkout strategy (concrete strategy)

import CheckoutStrategy from "./CheckoutStrategy.js";
import cartService from "../../cart/cart.service.js";
import { resolveItemsPricing } from "./resolveItemPricing.js";
import { runCheckout } from "./checkoutHelpers.js";
import { ValidationError } from "../../../utils/errors.js";
import APP_CONSTANTS from "../../../configs/constants.js";

/**
 * Checks out the caller's own cart when authenticated, or an explicit item list when a guest
 * (cart service has no persistent guest-cart support today).
 * @extends CheckoutStrategy (Strategy pattern)
 */
class CustomerCheckoutStrategy extends CheckoutStrategy {
    /**
     * @param {object} input
     * @param {number|null} input.userId
     * @param {string} [input.guest_email]
     * @param {object[]} [input.items] Required for guests; ignored for authenticated users
     * @param {object} input.shipping_address
     * @param {object} [input.billing_address]
     * @param {string} input.payment_method
     * @param {object} [input.payment_details]
     * @returns {Promise<object>} Checkout result
     */
    async checkout({
        userId,
        guest_email,
        items,
        shipping_address,
        billing_address,
        payment_method,
        payment_details,
    }) {
        let resolvedItems;
        let cartUserIdToClear = null;

        if (userId != null) {
            const cart = await cartService.viewCart(userId, {
                limit: APP_CONSTANTS.pagination.MAX_LIMIT,
            });

            if (cart.items.length === 0) {
                throw new ValidationError("Your cart is empty.");
            }

            resolvedItems = cart.items.map((item) => ({
                cid: item.cid,
                config_id: item.config_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
            }));
            cartUserIdToClear = userId;
        } else {
            resolvedItems = await resolveItemsPricing(items);
        }

        const result = await runCheckout({
            userId,
            guest_email,
            resolvedItems,
            shipping_address,
            billing_address,
            payment_method,
            payment_details,
        });

        if (cartUserIdToClear != null) {
            await cartService.clearCart(cartUserIdToClear);
        }

        return result;
    }
}

const customerCheckoutStrategy = new CustomerCheckoutStrategy();
export default customerCheckoutStrategy;
