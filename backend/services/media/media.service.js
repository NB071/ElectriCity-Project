// Media Service (Facade)

import {
  resolveMediaById,
  resolveMediaByCid,
  resolvePrimaryCatalogImage,
  resolvePreviewImagesByCids,
  viewAllMedia,
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
  resolvePreviewImagesByCids,
  viewAllMedia,

  // Mutations
  recordMedia,
  linkMediaToCatalogItem,
  setPrimaryCatalogImage,
  unlinkMediaFromCatalogItem,
  deleteMediaById,

  // Constants
  VALIDATIONS,
};
