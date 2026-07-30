// Catalog Product
// CQRS - Query side

import productDAO from "./productDAO.js";
import mediaAdapter from "../MediaAdapter.js";
import DetailsRegistry from "./details/detailsRegistry.js";
import CompareRegistry from "./compare/compareRegistry.js";
import CompareMatrixAssembler from "./compare/compareMatrixAssembler.js";
import {
    validateBrowseFilters,
    validateFacetsQuery,
    validateSortParams,
    validateSearchQuery,
    validateCompareQuery,
    validateCatalogItemId,
} from "./productValidator.js";
import { ValidationError, NotFoundError } from "../../../utils/errors.js";
import {
    parsePaginationQuery,
    paginationMeta,
    validatePaginationParams,
} from "../../../utils/pagination.js";
import { toCatalogListItemDTO } from "./DTOs/catalogListItemDTO.js";
import { toVehicleFacetsDTO } from "./DTOs/vehicleFacetsDTO.js";
import { getForItem as getOptionsForItem, getEquippedForItem } from "../_options/optionsQuery.js";
import { getPromotionsForItems } from "../_promotions/promotionsQuery.js";
import { DEFAULTS, VALIDATIONS } from "../constants.js";

const detailsRegistry = new DetailsRegistry({
    productDAO,
    optionsQuery: {
        getForItem: getOptionsForItem,
        getEquippedForItem,
    },
    mediaAdapter,
});

const compareRegistry = new CompareRegistry({
    productDAO,
    compareMatrixAssembler: new CompareMatrixAssembler(),
});

/**
 * This function maps the list rows to a representable format.
 * @helper_function
 * @private
 * @param {object[]} rows List rows
 * @returns {Promise<object[]>}
 */
async function mapListRows(rows) {
    const cids = rows.map((row) => row.cid);
    const [promotionsByCid, imagesByCid] = await Promise.all([
        getPromotionsForItems(cids),
        mediaAdapter.getPreviewImagesByCids(cids, DEFAULTS.LIST_IMAGE_LIMIT),
    ]);

    return rows.map((row) =>
        toCatalogListItemDTO(
            row,
            imagesByCid.get(row.cid) ?? [],
            promotionsByCid.get(row.cid) ?? [],
        ),
    );
}

/**
 * This function browses the vehicles.
 * @param {object} queryParams Query parameters
 * @returns {Promise<object>}
 * @throws {ValidationError} If the pagination parameters are invalid
 * @throws {NotFoundError} If the catalog item does not exist
 * @throws {DatabaseError} On database failures
 */
async function browseVehicles(queryParams = {}) {
    if (!validatePaginationParams(queryParams)) {
        throw new ValidationError("Invalid pagination parameters.");
    }

    const filters = validateBrowseFilters(queryParams);
    const { sort } = validateSortParams(queryParams);
    const pagination = parsePaginationQuery(queryParams);

    const total = await productDAO.countVehicles(filters, sort);
    const rows = await productDAO.findVehicles(
        filters,
        pagination.limit,
        pagination.offset,
        sort,
    );

    return {
        items: await mapListRows(rows),
        pagination: paginationMeta({ ...pagination, total }),
        sort,
    };
}

/**
 * This function searches the vehicles. 
 * @param {object} queryParams Query parameters
 * @returns {Promise<object>}
 * @throws {ValidationError} If the pagination parameters are invalid
 * @throws {NotFoundError} If the catalog item does not exist
 * @throws {DatabaseError} On database failures
 */
async function searchVehicles(queryParams = {}) {
    if (!validatePaginationParams(queryParams)) {
        throw new ValidationError("Invalid pagination parameters.");
    }

    const { q } = validateSearchQuery(queryParams);
    const { sort } = validateSortParams(queryParams);
    const pagination = parsePaginationQuery(queryParams);

    const filters = { ...validateBrowseFilters(queryParams), search: q };
    const total = await productDAO.countVehicles(filters, sort);
    const rows = await productDAO.findVehicles(
        filters,
        pagination.limit,
        pagination.offset,
        sort,
    );

    return {
        items: await mapListRows(rows),
        pagination: paginationMeta({ ...pagination, total }),
        sort,
        q,
    };
}

/**
 * This function returns facet counts for the vehicle catalog.
 * With no query params, counts cover the full active inventory against
 * canonical facet values. Browse filters narrow the base set; each facet
 * dimension ignores its own selected value so unchecked buckets stay visible.
 * @param {object} [queryParams] Same browse filters, plus optional `fields`
 * @returns {Promise<object>}
 * @throws {ValidationError} If filters or fields are invalid
 * @throws {DatabaseError} On database failures
 */
async function getVehicleFacets(queryParams = {}) {
    const { filters, fields } = validateFacetsQuery(queryParams);
    const total = await productDAO.countVehicles(filters);

    const result = { total };

    if (fields.includes("body_shape")) {
        result.body_shape = await productDAO.countVehiclesByFacet(filters, {
            excludeKey: "body_shape",
            columnSql: "vm.body_shape",
            allowedValues: VALIDATIONS.BODY_SHAPES,
        });
    }

    if (fields.includes("condition")) {
        result.condition = await productDAO.countVehiclesByFacet(filters, {
            excludeKey: "condition",
            columnSql: "v.`condition`",
            allowedValues: VALIDATIONS.VEHICLE_CONDITIONS,
        });
    }

    if (fields.includes("drivetrain")) {
        result.drivetrain = await productDAO.countVehiclesByFacet(filters, {
            excludeKey: "drivetrain",
            columnSql: "vm.drivetrain",
            allowedValues: VALIDATIONS.DRIVETRAINS,
        });
    }

    if (fields.includes("promo")) {
        result.promo = await productDAO.countVehiclesByPromoFacet(
            filters,
            VALIDATIONS.PROMO_TYPES,
        );
    }

    return toVehicleFacetsDTO(result);
}

async function getCatalogItemDetails(cid) {
    const id = validateCatalogItemId(cid);
    const base = await productDAO.findBaseById(id);

    if (!base) {
        throw new NotFoundError("Catalog item");
    }

    const handler = detailsRegistry.get(base.item_type);
    return handler.getDetails(id);
}

async function compareCatalogItems(queryParams = {}) {
    const validCids = validateCompareQuery(queryParams);
    const items = await productDAO.findManyForCompare(validCids);

    if (items.length !== validCids.length) {
        throw new NotFoundError("Catalog item");
    }

    const itemType = items[0].item_type;
    const handler = compareRegistry.get(itemType);
    return handler.compare(validCids);
}

/**
 * This function verifies that a catalog item exists.
 * @param {number|string} cid Catalog item id
 * @param {object} [options]
 * @param {boolean} [options.requireActive=false] When true, inactive items are treated as not found
 * @returns {Promise<void>}
 * @throws {ValidationError} If the catalog item id is invalid
 * @throws {NotFoundError} If the catalog item does not exist (or is inactive when required)
 */
async function ensureCatalogItemExists(cid, { requireActive = false } = {}) {
    const id = validateCatalogItemId(cid);
    const exists = await productDAO.existsById(id, { requireActive });
    if (!exists) {
        throw new NotFoundError("Catalog item");
    }
}

export {
    browseVehicles,
    searchVehicles,
    getVehicleFacets,
    getCatalogItemDetails,
    compareCatalogItems,
    ensureCatalogItemExists,
};
