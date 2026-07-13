// Cart Service (Helpers)

import { DEFAULTS } from "../constants.js";

/**
 * This function computes the guest cart expiry timestamp.
 * @helper_function
 * @returns {Date} The guest cart expiry timestamp
 */
function guestExpiresAt() {
    // Create a new date object
    const expires = new Date();

    // Set the date to the default guest cart TTL days
    expires.setUTCDate(expires.getUTCDate() + DEFAULTS.GUEST_CART_TTL_DAYS);
    return expires;
}

export { guestExpiresAt };
