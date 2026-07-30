// Order Service
// Strategy pattern / guest checkout strategy (concrete strategy)

import CheckoutStrategy from "./CheckoutStrategy.js";
import cartDAO from "../../cart/cartDAO.js";
import { runCheckout } from "./checkoutHelpers.js";
import { ValidationError } from "../../../utils/errors.js";

/**
 * This class is responsible for checking out a guest
 * @class
 * @extends CheckoutStrategy (Strategy pattern)
 */
class GuestCheckoutStrategy extends CheckoutStrategy {
    /**
     * @param {object} input Guest checkout input
     * @param {string|null} [input.sessionToken] Session token
     * @param {string} input.guest_email Guest email
     * @param {object[]} [input.items] Fallback when no X-Cart-Session cart exists
     * @param {object} input.shipping_address Shipping address
     * @param {object} [input.billing_address] Billing address
     * @param {string} input.payment_method Payment method
     * @param {object} [input.payment_details] Payment details
     * @returns {Promise<object>} Checkout result
     */
    async checkout({
        sessionToken = null,
        guest_email,
        items,
        shipping_address,
        billing_address,
        payment_method,
        payment_details,
        additional_information,
    }) {
        // if the session token is provided, find the active guest cart by the session token
        if (sessionToken) {
            // find the active guest cart by the session token
            const cart =
                await cartDAO.findActiveGuestCartBySessionToken(sessionToken);
            // if the cart is not found, throw a validation error
            if (!cart) {
                throw new ValidationError("Your cart is empty.");
            }
            // run the checkout
            return runCheckout({
                userId: null,
                guest_email,
                cartId: cart.cart_id,
                shipping_address,
                billing_address,
                payment_method,
                payment_details,
                additional_information,
            });
        }
        // if the session token is not provided, run the checkout with the items
        return runCheckout({
            userId: null,
            guest_email,
            items,
            shipping_address,
            billing_address,
            payment_method,
            payment_details,
            additional_information,
        });
    }
}

const guestCheckoutStrategy = new GuestCheckoutStrategy();
export default guestCheckoutStrategy;
