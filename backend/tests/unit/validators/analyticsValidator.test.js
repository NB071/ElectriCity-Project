import { ValidationError } from "../../../utils/errors.js";
import {
    validateEvent,
    validateEventId,
    validateReportParams,
    validateEventListParams,
} from "../../../services/analytics/_track/trackValidator.js";
import { EVENT_DEFINITIONS } from "../../../services/analytics/constants.js";

describe("analyticsValidator", () => {
    test("validateEvent accepts known event type", () => {
        const data = validateEvent({
            event_type_id: EVENT_DEFINITIONS.CATALOG.VEHICLE_DETAILS_VIEW,
            cid: 1,
            user_id: null,
            meta: { source: "unit" },
        });
        expect(data.event_type_id).toBe(2);
    });

    test("validateEvent rejects unknown event type", () => {
        expect(() => validateEvent({ event_type_id: 999 })).toThrow(
            ValidationError,
        );
        expect(() => validateEvent({})).toThrow(ValidationError);
    });

    test("validateEventId", () => {
        expect(validateEventId("12")).toBe(12);
        expect(() => validateEventId(0)).toThrow(ValidationError);
    });

    test("validateReportParams defaults and range checks", () => {
        const params = validateReportParams({});
        expect(params.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(params.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(params.limit).toBeGreaterThan(0);

        expect(() =>
            validateReportParams({
                start: "2025-01-01",
                end: "2024-01-01",
            }),
        ).toThrow(ValidationError);

        expect(() =>
            validateReportParams({
                start: "2020-01-01",
                end: "2025-01-01",
            }),
        ).toThrow(ValidationError);

        expect(() => validateReportParams({ limit: 101 })).toThrow(
            ValidationError,
        );
    });

    test("validateEventListParams defaults and filters", () => {
        const defaults = validateEventListParams({});
        expect(defaults.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(defaults.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(defaults.event_type_id).toBeUndefined();
        expect(defaults.user_id).toBeUndefined();
        expect(defaults.cid).toBeUndefined();
        expect(defaults.q).toBeUndefined();

        const filtered = validateEventListParams({
            start: "2025-01-01",
            end: "2025-01-31",
            event_type_id: EVENT_DEFINITIONS.CART.ADD,
            user_id: "7",
            cid: "3",
            q: " Tesla ",
        });
        expect(filtered).toEqual({
            start: "2025-01-01",
            end: "2025-01-31",
            event_type_id: EVENT_DEFINITIONS.CART.ADD,
            user_id: 7,
            cid: 3,
            q: "Tesla",
        });

        expect(validateEventListParams({ q: "" }).q).toBeUndefined();

        expect(() =>
            validateEventListParams({
                start: "2025-01-01",
                end: "2024-01-01",
            }),
        ).toThrow(ValidationError);

        expect(() =>
            validateEventListParams({ event_type_id: 999 }),
        ).toThrow(ValidationError);

        expect(() => validateEventListParams({ q: "x".repeat(101) })).toThrow(
            ValidationError,
        );
    });
});
