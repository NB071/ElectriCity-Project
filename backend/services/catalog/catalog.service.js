// Catalog Service (Facade)

import {
    browseVehicles,
    searchVehicles,
    getCatalogItemDetails,
    compareCatalogItems,
} from "./_product/productQuery.js";
import { createConfiguration } from "./_configurations/configurationsMutation.js";
import { getConfigurationById } from "./_configurations/configurationsQuery.js";
import {
    ITEM_TYPES,
    PROMO_TYPES,
    VALIDATIONS,
    DEFAULTS,
    PROMO_NAME_MATCH,
} from "./constants.js";

const catalogService = {
    // Query functions
    browseVehicles,
    searchVehicles,
    getCatalogItemDetails,
    compareCatalogItems,
    getConfigurationById,

    // Mutation functions
    createConfiguration,

    // Constants
    ITEM_TYPES,
    PROMO_TYPES,
    VALIDATIONS,
    DEFAULTS,
    PROMO_NAME_MATCH,
};

export default catalogService;

export {
    // Query functions
    browseVehicles,
    searchVehicles,
    getCatalogItemDetails,
    compareCatalogItems,
    getConfigurationById,

    // Mutation functions
    createConfiguration,

    // Constants
    ITEM_TYPES,
    PROMO_TYPES,
    VALIDATIONS,
    DEFAULTS,
    PROMO_NAME_MATCH,
};
