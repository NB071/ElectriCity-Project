// Cart Service (Helpers)

import { CART_KINDS } from "../constants.js";

/**
 * This function resolves the cart owner kind from validated owner fields.
 * The authenticated user id wins over the guest session token.
 * @helper_function
 * @param {{ userId?: number|null, sessionToken?: string|null }} owner
 * @returns {string} CART_KINDS.CUSTOMER | CART_KINDS.GUEST
 */
function resolveCartKind(owner) {
    return owner.userId != null ? CART_KINDS.CUSTOMER : CART_KINDS.GUEST;
}

export { resolveCartKind };
