// Cart Service (Facade)

import { viewCart } from "./cartQuery.js";
import {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
} from "./cartMutation.js";
import { VALIDATIONS, DEFAULTS } from "./constants.js";

const cartService = {
    viewCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    VALIDATIONS,
    DEFAULTS,
};

export default cartService;

export {
    // Queries
    viewCart,

    // Mutations
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,

    // Constants
    VALIDATIONS,
    DEFAULTS,
};
