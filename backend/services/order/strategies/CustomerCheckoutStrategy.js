// Order Service
// Strategy pattern / customer checkout strategy (concrete strategy)

import CheckoutStrategy from "./CheckoutStrategy.js";
import cartDAO from "../../cart/cartDAO.js";
import { runCheckout } from "./checkoutHelpers.js";
import { ValidationError } from "../../../utils/errors.js";

/**
 * This class checks out the authenticated customer's cart.
 * @class
 * @extends CheckoutStrategy (Strategy pattern)
 */
class CustomerCheckoutStrategy extends CheckoutStrategy {
    /**
     * @param {object} input
     * @param {number} input.userId
     * @param {object} input.shipping_address
     * @param {object} [input.billing_address]
     * @param {string} input.payment_method
     * @param {object} [input.payment_details]
     * @returns {Promise<object>} Checkout result
     */
    async checkout({
        userId,
        shipping_address,
        billing_address,
        payment_method,
        payment_details,
        additional_information,
    }) {
        // find the cart by the user id
        const cart = await cartDAO.findCartByUserId(userId);

        if (!cart) {
            throw new ValidationError("Your cart is empty.");
        }

        // run the checkout
        return runCheckout({
            userId,
            guest_email: null,
            cartId: cart.cart_id,
            shipping_address,
            billing_address,
            payment_method,
            payment_details,
            additional_information,
        });
    }
}

const customerCheckoutStrategy = new CustomerCheckoutStrategy();
export default customerCheckoutStrategy;
