// Resolves a vehicle reference (cid or model name) to a catalog item id

import catalogService from "../../../catalog/catalog.service.js";
import { DEFAULTS } from "../../constants.js";

/**
 * This function converts a catalog list item to a match summary.
 * @param {object} item Catalog list item DTO
 * @returns {object}
 */
function toMatchSummary(item) {
    return {
        cid: item.id,
        name: item.name,
        brand: item.brand?.name ?? null,
        model: item.model?.name ?? null,
        condition: item.vehicle?.condition ?? null,
        year: item.vehicle?.year ?? null,
        base_price: item.base_price,
    };
}

/**
 * @param {object[]} items
 * @param {string} modelName
 * @param {string} [brandName]
 * @returns {object[]}
 */
function filterMatches(items, modelName, brandName) {
    const modelLower = modelName.trim().toLowerCase();
    const brandLower = brandName?.trim().toLowerCase();

    return items.filter((item) => {
        const fullName = item.name?.toLowerCase() ?? "";
        const model = item.model?.name?.toLowerCase() ?? "";
        const brand = item.brand?.name?.toLowerCase() ?? "";

        const modelMatches =
            model.includes(modelLower) || fullName.includes(modelLower);
        const brandMatches = brandLower ? brand.includes(brandLower) : true;

        return modelMatches && brandMatches;
    });
}

/**
 * @param {object} params
 * @param {number} [params.cid]
 * @param {string} [params.model_name]
 * @param {string} [params.brand_name]
 * @param {"new"|"used"} [params.condition]
 * @param {number} [params.year]
 * @returns {Promise<{ cid: number } | { ambiguous: true, matches: object[] } | { error: object }>}
 */
async function resolveVehicleReference({
    cid,
    model_name,
    brand_name,
    condition,
    year,
} = {}) {
    if (cid != null) {
        return { cid };
    }

    if (!model_name?.trim()) {
        return {
            error: {
                code: "VALIDATION_ERROR",
                message: "Either cid or model_name is required.",
            },
        };
    }

    const searchQuery = [brand_name, model_name].filter(Boolean).join(" ").trim();
    const searchParams = {
        q: searchQuery,
        page: DEFAULTS.TOOL_PAGE,
        limit: DEFAULTS.TOOL_LIMIT,
        sort: DEFAULTS.TOOL_SORT,
        ...(condition ? { condition } : {}),
        ...(year != null ? { year_min: year, year_max: year } : {}),
    };

    const result = await catalogService.searchVehicles(searchParams);
    const matches = filterMatches(result.items, model_name, brand_name);

    if (matches.length === 0) {
        return {
            error: {
                code: "NOT_FOUND",
                message: `No vehicle found matching model "${model_name}".`,
            },
        };
    }

    if (matches.length === 1) {
        return { cid: matches[0].id };
    }

    return {
        ambiguous: true,
        matches: matches.map(toMatchSummary),
    };
}

export default resolveVehicleReference;

export { resolveVehicleReference, toMatchSummary };
