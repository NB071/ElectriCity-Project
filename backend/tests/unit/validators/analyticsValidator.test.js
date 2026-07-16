import { ValidationError } from "../../../utils/errors.js";
import {
    validateEvent,
    validateEventId,
    validateReportParams,
} from "../../../services/analytics/analyticsValidator.js";
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
});
