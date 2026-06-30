// Analytics Service (Facade)

import { capture, setEventTypeActive } from "./analyticsMutation.js";
import {
    eventTypeBreakdown,
    topCatalogItems,
    trend,
    eventDetail,
} from "./analyticsQuery.js";
import {
    EVENT_IDS,
    EVENT_DEFINITIONS,
    REPORT_DEFAULTS,
    REDIS,
} from "./constants.js";

const analyticsService = {
    capture,
    setEventTypeActive,
    eventTypeBreakdown,
    topCatalogItems,
    trend,
    eventDetail,
    EVENT_IDS,
    EVENT_DEFINITIONS,
    REPORT_DEFAULTS,
    REDIS,
};

export default analyticsService;

export {
    capture,
    setEventTypeActive,
    eventTypeBreakdown,
    topCatalogItems,
    trend,
    eventDetail,
    EVENT_IDS,
    EVENT_DEFINITIONS,
    REPORT_DEFAULTS,
    REDIS,
};
