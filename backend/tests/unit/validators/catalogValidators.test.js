import { ValidationError } from "../../../utils/errors.js";
import {
    validateBrowseFilters,
    validateSortParams,
    validateSearchQuery,
    validateCompareQuery,
    validateCatalogItemId,
} from "../../../services/catalog/_product/productValidator.js";
import { validatePromoType } from "../../../services/catalog/_promotions/promotionValidator.js";
import {
    validateCatalogItemId as validateOptionCid,
    validateConfigurationOptions,
} from "../../../services/catalog/_options/optionsValidator.js";
import {
    validateCreateConfiguration,
    validateConfigId,
} from "../../../services/catalog/_configurations/configurationsValidator.js";
import { PROMO_TYPES } from "../../../services/catalog/constants.js";

describe("productValidator", () => {
    test("browse filters and year range", () => {
        expect(validateBrowseFilters({ condition: "used" }).condition).toBe(
            "used",
        );
        expect(
            validateBrowseFilters({ year_min: 2020, year_max: 2024 }).year_min,
        ).toBe(2020);
        expect(() =>
            validateBrowseFilters({ year_min: 2025, year_max: 2020 }),
        ).toThrow(ValidationError);
        expect(() =>
            validateBrowseFilters({ condition: "scrap" }),
        ).toThrow(ValidationError);
    });

    test("sort / search / compare / cid", () => {
        expect(validateSortParams({}).sort).toBeTruthy();
        expect(() => validateSortParams({ sort: "nope" })).toThrow(
            ValidationError,
        );

        expect(validateSearchQuery({ q: "Tesla" }).q).toBe("Tesla");
        expect(() => validateSearchQuery({ q: "" })).toThrow(ValidationError);

        expect(validateCompareQuery({ cids: "1,2,3" })).toEqual([1, 2, 3]);
        expect(() => validateCompareQuery({ cids: "1" })).toThrow(
            ValidationError,
        );
        expect(() => validateCompareQuery({})).toThrow(ValidationError);

        expect(validateCatalogItemId(4)).toBe(4);
        expect(() => validateCatalogItemId(-1)).toThrow(ValidationError);
    });
});

describe("promotion / options / configurations validators", () => {
    test("promo type", () => {
        expect(validatePromoType(PROMO_TYPES.CLEARANCE)).toBe(
            PROMO_TYPES.CLEARANCE,
        );
        expect(() => validatePromoType("bogus")).toThrow(ValidationError);
    });

    test("options + configurations", () => {
        expect(validateOptionCid(1)).toBe(1);
        expect(
            validateConfigurationOptions({ cid: 1, option_ids: [10, 11] })
                .option_ids,
        ).toEqual([10, 11]);
        expect(() =>
            validateConfigurationOptions({ cid: 1, option_ids: [] }),
        ).toThrow(ValidationError);

        expect(
            validateCreateConfiguration({ cid: 1, option_ids: [5] }).cid,
        ).toBe(1);
        expect(validateConfigId("9")).toBe(9);
        expect(() => validateConfigId(0)).toThrow(ValidationError);
    });
});
