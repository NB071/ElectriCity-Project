// Payment Service
// Shared mock gateway helpers

import paymentDAO from "../paymentDAO.js";
import { VALIDATIONS } from "../constants.js";

/**
 * This function acts as a mock gateway for the payment strategy pattern.
 * It fails every 3rd attempt per user+method (logged-in) or order+method (guest).
 * @param {object} input
 * @param {number|null} input.user_id
 * @param {number} input.order_id
 * @param {string} input.payment_method
 * @returns {Promise<string>}
 */
async function resolveMockAttemptStatus({ user_id, order_id, payment_method }) {
    const priorAttempts =
        user_id != null
            ? await paymentDAO.countAttemptsByUserAndMethod(
                  user_id,
                  payment_method,
              )
            : await paymentDAO.countAttemptsByOrderAndMethod(
                  order_id,
                  payment_method,
              );

    return (priorAttempts + 1) % 3 === 0
        ? VALIDATIONS.ATTEMPT_STATUS.FAILED
        : VALIDATIONS.ATTEMPT_STATUS.SUCCESS;
}

export { resolveMockAttemptStatus };
