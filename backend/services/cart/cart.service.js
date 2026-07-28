// Cart Service (Facade)

import { viewCart, viewCartSummary } from "./cartQuery.js";
import {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCartIntoUser,
} from "./cartMutation.js";
import {
    CART_KINDS,
    VALIDATIONS,
    DEFAULTS,
    CART_HEADERS,
    CART_COOKIES,
} from "./constants.js";

const cartService = {
    viewCart,
    viewCartSummary,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCartIntoUser,
    CART_KINDS,
    VALIDATIONS,
    DEFAULTS,
    CART_HEADERS,
    CART_COOKIES,
};

export default cartService;

export {
    viewCart,
    viewCartSummary,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCartIntoUser,
    CART_KINDS,
    VALIDATIONS,
    DEFAULTS,
    CART_HEADERS,
    CART_COOKIES,
};
