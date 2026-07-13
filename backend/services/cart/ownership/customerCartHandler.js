// Customer Cart Handler
// Design Pattern / Technique: GoF Template Method / Object-Oriented Programming (OOP)

import CartHandler from "./cartHandler.js";

/**
 * This class handles the cart operations for a customer.
 * @class
 * @extends CartHandler
 * @see {@link https://refactoring.guru/design-patterns/template-method}
 */
class CustomerCartHandler extends CartHandler {
    /**
     * @protected
     * @param {{ userId: number }} owner The owner of the cart
     * @returns {Promise<{ cart_id: number, session_token: null, is_guest: false }>}
     */
    async _ensureCart({ userId }) {
        // Ensure the cart exists for the user
        const cart_id = await this.cartDAO.ensureCartForUser(userId);

        // Return the cart id and the owner metadata
        return {
            cart_id,
            session_token: null,
            is_guest: false,
        };
    }
}

export default CustomerCartHandler;
