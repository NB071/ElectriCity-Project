// Payment Service
// Strategy registry & context

import creditCardStrategy from "./CreditCardStrategy.js";
import debitCardStrategy from "./DebitCardStrategy.js";
import applePayStrategy from "./ApplePayStrategy.js";
import PaymentContext from "./PaymentContext.js";
import { VALIDATIONS } from "../constants.js";
import { ValidationError } from "../../../utils/errors.js";

/**
 * Registry of available payment strategies, keyed by payment method.
 */
const strategies = {
    [VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD]: creditCardStrategy,
    [VALIDATIONS.PAYMENT_METHODS.DEBIT_CARD]: debitCardStrategy,
    [VALIDATIONS.PAYMENT_METHODS.APPLE_PAY]: applePayStrategy,
};

/**
 * This looks up a payment strategy by method and returns it wrapped in a context.
 * @param {string} method Payment method from VALIDATIONS.PAYMENT_METHODS constants
 * @returns {PaymentContext}
 * @throws {ValidationError} If no strategy is registered under the given method
 */
function getStrategy(method) {
    const strategy = strategies[method];

    if (!strategy) {
        throw new ValidationError(
            `Unknown payment method "${method}". Registered: ${Object.keys(strategies).join(", ")}`,
        );
    }

    const context = new PaymentContext();
    context.setStrategy(strategy);
    return context;
}

export default getStrategy;
