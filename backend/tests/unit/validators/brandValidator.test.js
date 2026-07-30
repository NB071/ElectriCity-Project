import { ValidationError } from "../../../utils/errors.js";
import {
    validateBrandId,
    validateListBrandsQuery,
} from "../../../services/catalog/_brand/brandValidator.js";

describe("brandValidator", () => {
    test("validateBrandId accepts positive integers", () => {
        expect(validateBrandId("12")).toBe(12);
        expect(validateBrandId(3)).toBe(3);
    });

    test.each([0, -1, "abc", 1.5])(
        "validateBrandId rejects invalid value %s",
        (value) => {
            expect(() => validateBrandId(value)).toThrow(ValidationError);
        },
    );

    test.each([
        ["true", true],
        ["1", true],
        ["yes", true],
        ["false", false],
        ["0", false],
        ["no", false],
    ])(
        "validateListBrandsQuery coerces %s to %s",
        (input, expected) => {
            expect(
                validateListBrandsQuery({ is_featured: input }).is_featured,
            ).toBe(expected);
            expect(validateListBrandsQuery({ lite: input }).lite).toBe(
                expected,
            );
        },
    );

    test("validateListBrandsQuery accepts boolean inputs directly", () => {
        expect(
            validateListBrandsQuery({
                is_featured: true,
                lite: false,
            }),
        ).toEqual({
            is_featured: true,
            lite: false,
        });
    });

    test("validateListBrandsQuery rejects invalid boolean strings", () => {
        expect(() =>
            validateListBrandsQuery({ is_featured: "maybe" }),
        ).toThrow(ValidationError);
        expect(() => validateListBrandsQuery({ lite: "2" })).toThrow(
            ValidationError,
        );
    });

    test("validateListBrandsQuery allows empty query", () => {
        expect(validateListBrandsQuery({})).toEqual({
            is_featured: undefined,
            lite: undefined,
        });
    });
});
