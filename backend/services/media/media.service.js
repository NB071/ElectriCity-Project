// Media Service (Facade)

import {
    resolveMediaById,
    resolveMediaByCid,
    resolvePrimaryCatalogImage,
} from "./mediaQuery.js";
import {
    recordMedia,
    linkMediaToCatalogItem,
    setPrimaryCatalogImage,
    unlinkMediaFromCatalogItem,
    deleteMediaById,
} from "./mediaMutation.js";
import { VALIDATIONS } from "./constants.js";

export {
    // Queries
    resolveMediaById,
    resolveMediaByCid,
    resolvePrimaryCatalogImage,

    // Mutations
    recordMedia,
    linkMediaToCatalogItem,
    setPrimaryCatalogImage,
    unlinkMediaFromCatalogItem,
    deleteMediaById,

    // Constants
    VALIDATIONS,
};
