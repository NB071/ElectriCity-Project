// Cart Service (Facade)

import { viewCart } from "./cartQuery.js";
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
} from "./constants.js";

const cartService = {
    viewCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCartIntoUser,
    CART_KINDS,
    VALIDATIONS,
    DEFAULTS,
    CART_HEADERS,
};

export default cartService;

export {
    viewCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCartIntoUser,
    CART_KINDS,
    VALIDATIONS,
    DEFAULTS,
    CART_HEADERS,
};
