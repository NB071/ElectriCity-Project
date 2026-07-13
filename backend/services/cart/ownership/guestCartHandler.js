// Guest Cart Handler
// Design Pattern / Technique: GoF Template Method / Object-Oriented Programming (OOP)

import CartHandler from "./cartHandler.js";
import { guestExpiresAt } from "../helpers/guestExpiresAt.js";

/**
 * This class handles the cart operations for a guest.
 * @class
 * @extends CartHandler
 * @see {@link https://refactoring.guru/design-patterns/template-method}
 */
class GuestCartHandler extends CartHandler {
    /**
     * @protected
     * @param {{ sessionToken: string|null }} owner The owner of the cart
     * @returns {Promise<{ cart_id: number, session_token: string, is_guest: true }>} The cart id and the owner metadata
     */
    async _ensureCart({ sessionToken }) {
        // Ensure the cart exists for the guest
        return this.cartDAO.ensureCartForGuest(sessionToken, guestExpiresAt());
    }

    /**
     * Owner metadata attached to responses.
     * @protected
     * @param {{ session_token: string, is_guest: boolean }} cart The cart
     * @returns {{ session_token: string, is_guest: true }} The owner metadata
     */
    _ownerMeta(cart) {
        // Return the owner metadata
        return {
            session_token: cart.session_token,
            is_guest: true,
        };
    }
}

export default GuestCartHandler;
