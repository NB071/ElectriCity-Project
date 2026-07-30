// Wishlist Service (Facade)

import {
    listWishlistIds,
    viewWishlist,
    isInWishlist,
} from "./wishlistQuery.js";
import { addToWishlist, removeFromWishlist } from "./wishlistMutation.js";
import { VALIDATIONS, DEFAULTS } from "./constants.js";

const wishlistService = {
    listWishlistIds,
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
    listWishlistIds,
    viewWishlist,
    isInWishlist,

    // Mutations
    addToWishlist,
    removeFromWishlist,

    // Constants
    VALIDATIONS,
    DEFAULTS,
};
