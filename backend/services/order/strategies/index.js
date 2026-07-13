// Order Service
// Checkout strategy registry & context

import customerCheckoutStrategy from "./CustomerCheckoutStrategy.js";
import guestCheckoutStrategy from "./GuestCheckoutStrategy.js";
import CheckoutContext from "./CheckoutContext.js";
import { CHECKOUT_ACTORS } from "../constants.js";
import { ValidationError } from "../../../utils/errors.js";

/**
 * Registry of available checkout strategies, keyed by actor (customer | guest).
 */
const strategies = {
    [CHECKOUT_ACTORS.CUSTOMER]: customerCheckoutStrategy,
    [CHECKOUT_ACTORS.GUEST]: guestCheckoutStrategy,
};

/**
 * Looks up a checkout strategy by actor and returns it wrapped in a context.
 * @param {string} actor Checkout actor from CHECKOUT_ACTORS
 * @returns {CheckoutContext} Checkout context
 * @throws {ValidationError} If no strategy is registered under the given actor
 */
function getCheckoutStrategy(actor) {
    const strategy = strategies[actor];

    if (!strategy) {
        throw new ValidationError(
            `Unknown checkout actor "${actor}". Registered: ${Object.keys(strategies).join(", ")}`,
        );
    }

    const context = new CheckoutContext();
    context.setStrategy(strategy);
    return context;
}

export default getCheckoutStrategy;
