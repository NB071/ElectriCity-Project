// Order Service
// Strategy pattern / customer (and guest) checkout strategy (concrete strategy)

import CheckoutStrategy from "./CheckoutStrategy.js";
import cartService from "../../cart/cart.service.js";
import { resolveItemsPricing } from "./resolveItemPricing.js";
import { runCheckout } from "./checkoutHelpers.js";
import { ValidationError } from "../../../utils/errors.js";
import APP_CONSTANTS from "../../../configs/constants.js";

/**
 * Checks out the caller's cart when authenticated or when a guest cart session is present.
 * Guests may still pass an explicit items list (legacy) when no cart session exists.
 * @extends CheckoutStrategy (Strategy pattern)
 */
class CustomerCheckoutStrategy extends CheckoutStrategy {
    /**
     * @param {object} input
     * @param {number|null} input.userId
     * @param {string|null} [input.sessionToken]
     * @param {string} [input.guest_email]
     * @param {object[]} [input.items] Fallback for guests without a cart session
     * @param {object} input.shipping_address
     * @param {object} [input.billing_address]
     * @param {string} input.payment_method
     * @param {object} [input.payment_details]
     * @returns {Promise<object>} Checkout result
     */
    async checkout({
        userId,
        sessionToken = null,
        guest_email,
        items,
        shipping_address,
        billing_address,
        payment_method,
        payment_details,
    }) {
        let resolvedItems;
        let clearOwner = null;

        if (userId != null) {
            const cart = await cartService.viewCart(
                { userId },
                { limit: APP_CONSTANTS.pagination.MAX_LIMIT },
            );

            if (cart.items.length === 0) {
                throw new ValidationError("Your cart is empty.");
            }

            resolvedItems = cart.items.map((item) => ({
                cid: item.cid,
                config_id: item.config_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
            }));
            clearOwner = { userId };
        } else if (sessionToken) {
            const cart = await cartService.viewCart(
                { sessionToken },
                { limit: APP_CONSTANTS.pagination.MAX_LIMIT },
            );

            if (cart.items.length === 0) {
                throw new ValidationError("Your cart is empty.");
            }

            resolvedItems = cart.items.map((item) => ({
                cid: item.cid,
                config_id: item.config_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
            }));
            clearOwner = { sessionToken };
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

        if (clearOwner != null) {
            await cartService.clearCart(clearOwner);
        }

        return result;
    }
}

const customerCheckoutStrategy = new CustomerCheckoutStrategy();
export default customerCheckoutStrategy;
