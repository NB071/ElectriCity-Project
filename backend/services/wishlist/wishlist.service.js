// Wishlist Service (Facade)

import { viewWishlist, isInWishlist } from "./wishlistQuery.js";
import { addToWishlist, removeFromWishlist } from "./wishlistMutation.js";
import { VALIDATIONS, DEFAULTS } from "./constants.js";

const wishlistService = {
    viewWishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    VALIDATIONS,
    DEFAULTS,
};

export default wishlistService;

export {
    // Queries
    viewWishlist,
    isInWishlist,

    // Mutations
    addToWishlist,
    removeFromWishlist,

    // Constants
    VALIDATIONS,
    DEFAULTS,
};
