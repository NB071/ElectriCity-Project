// Catalog Product
// CQRS - Query side

import productDAO from "./productDAO.js";
import mediaAdapter from "../MediaAdapter.js";
import DetailsRegistry from "./details/detailsRegistry.js";
import CompareRegistry from "./compare/compareRegistry.js";
import CompareMatrixAssembler from "./compare/compareMatrixAssembler.js";
import {
    validateBrowseFilters,
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
import { getForItem as getOptionsForItem } from "../_options/optionsQuery.js";
import { getPromotionsForItems } from "../_promotions/promotionsQuery.js";

const detailsRegistry = new DetailsRegistry({
    productDAO,
    optionsQuery: { getForItem: getOptionsForItem },
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
    const promotionsByCid = await getPromotionsForItems(rows.map((row) => row.cid));

    return Promise.all(
        rows.map(async (row) => {
            let primaryImage = null;

            try {
                primaryImage = await mediaAdapter.getPrimaryImage(row.cid);
            } catch (error) {
                if (!(error instanceof NotFoundError)) {
                    throw error;
                }
            }

            return toCatalogListItemDTO(
                row,
                primaryImage,
                promotionsByCid.get(row.cid) ?? [],
            );
        }),
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

export {
    browseVehicles,
    searchVehicles,
    getCatalogItemDetails,
    compareCatalogItems,
};
