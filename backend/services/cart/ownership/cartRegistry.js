// Cart Registry
// Design Pattern / Technique: Template Method / Object-Oriented Programming (OOP)

import CustomerCartHandler from "./customerCartHandler.js";
import GuestCartHandler from "./guestCartHandler.js";
import { CART_KINDS } from "../constants.js";
import { ValidationError } from "../../../utils/errors.js";

/**
 * This class registers cart handlers by owner kind (customer vs guest).
 * @class
 */
class CartRegistry {
    /**
     * @constructor
     * @param {object} deps The dependencies
     * @param {import("../cartDAO.js").default} deps.cartDAO
     */
    constructor({ cartDAO }) {
        this.cartDAO = cartDAO;
        this.handlers = {
            [CART_KINDS.CUSTOMER]: CustomerCartHandler,
            [CART_KINDS.GUEST]: GuestCartHandler,
        };
    }

    /**
     * Get a cart handler by owner kind.
     * @param {string} kind Value from CART_KINDS
     * @returns {import("./cartHandler.js").default} The cart handler
     * @throws {ValidationError} If the cart kind is unknown
     */
    get(kind) {
        const Handler = this.handlers[kind];

        if (!Handler) {
            throw new ValidationError(`Unknown cart kind: ${kind}`);
        }

        return new Handler({
            cartDAO: this.cartDAO,
        });
    }
}

export default CartRegistry;
