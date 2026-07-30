// Catalog Brand
// CQRS - Query side

import brandDAO from "./brandDAO.js";
import { validateBrandId, validateListBrandsQuery } from "./brandValidator.js";
import { toBrandListItemDTO } from "./DTOs/brandListItemDTO.js";
import { toBrandLiteDTO } from "./DTOs/brandLiteDTO.js";
import { toBrandDetailDTO } from "./DTOs/brandDetailDTO.js";
import { toBrandModelListItemDTO } from "./DTOs/brandModelListItemDTO.js";
import { ValidationError } from "../../../utils/errors.js";
import {
    parsePaginationQuery,
    paginationMeta,
    validatePaginationParams,
} from "../../../utils/pagination.js";

/**
 * This function lists brands.
 * - `lite=true`: all matching brands as `{ id, name }` only (no pagination, A-Z).
 * - `is_featured=true`: featured set without pagination / display_order sort.
 * - otherwise: paginated list ordered by display_order (then name).
 * @param {object} [queryParams] Raw query params from req.query
 * @returns {Promise<{ items: object[], pagination?: object }>}
 * @throws {ValidationError} If query or pagination parameters are invalid
 * @throws {DatabaseError} On database failures
 */
async function listBrands(queryParams = {}) {
    const { is_featured: isFeatured, lite } =
        validateListBrandsQuery(queryParams);

    if (lite === true) {
        const filters =
            isFeatured === true
                ? { is_featured: true }
                : isFeatured === false
                  ? { is_featured: false }
                  : {};
        const rows = await brandDAO.findLiteBrands(filters);
        return {
            items: rows.map(toBrandLiteDTO),
        };
    }

    if (isFeatured === true) {
        const rows = await brandDAO.findBrands(
            { is_featured: true },
            { orderByDisplayOrder: false },
        );
        return {
            items: rows.map(toBrandListItemDTO),
        };
    }

    if (!validatePaginationParams(queryParams)) {
        throw new ValidationError("Invalid pagination parameters.");
    }

    const pagination = parsePaginationQuery(queryParams);
    const filters = isFeatured === false ? { is_featured: false } : {};
    const total = await brandDAO.countBrands(filters);
    const rows = await brandDAO.findBrands(filters, {
        orderByDisplayOrder: true,
        limit: pagination.limit,
        offset: pagination.offset,
    });

    return {
        items: rows.map(toBrandListItemDTO),
        pagination: paginationMeta({ ...pagination, total }),
    };
}

/**
 * This function returns one brand by ID.
 * @param {number|string} brandId
 * @returns {Promise<object>}
 * @throws {ValidationError} If brandId is invalid
 * @throws {NotFoundError} If the brand does not exist
 * @throws {DatabaseError} On database failures
 */
async function getBrandById(brandId) {
    const id = validateBrandId(brandId);
    const row = await brandDAO.findById(id);
    return toBrandDetailDTO(row);
}

/**
 * This function lists models for a brand (unpaginated, A-Z).
 * Used by filter UIs such as the storefront hero make → model cascade.
 * @param {number|string} brandId
 * @returns {Promise<{ items: object[] }>}
 * @throws {ValidationError} If brandId is invalid
 * @throws {NotFoundError} If the brand does not exist
 * @throws {DatabaseError} On database failures
 */
async function listBrandModels(brandId) {
    const id = validateBrandId(brandId);
    await brandDAO.findById(id);
    const rows = await brandDAO.findModelsByBrandId(id);
    return {
        items: rows.map(toBrandModelListItemDTO),
    };
}

export { listBrands, getBrandById, listBrandModels };
