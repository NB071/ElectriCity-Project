// Analytics Service (Facade)

import { capture, setEventTypeActive } from "./_track/trackMutation.js";
import {
  eventTypeBreakdown,
  topCatalogItems,
  trend,
  eventDetail,
} from "./_track/trackQuery.js";
import {
  getAdminOverview,
  getCustomerOverview,
} from "./_dashboard/dashboardQuery.js";
import {
  EVENT_IDS,
  EVENT_DEFINITIONS,
  REPORT_DEFAULTS,
  REDIS,
} from "./constants.js";

const analyticsService = {
  // Track - Mutations
  capture,
  setEventTypeActive,

  // Track - Queries
  eventTypeBreakdown,
  topCatalogItems,
  trend,
  eventDetail,

  // Dashboard - Queries
  getAdminOverview,
  getCustomerOverview,

  // Constants
  EVENT_IDS,
  EVENT_DEFINITIONS,
  REPORT_DEFAULTS,
  REDIS,
};

export default analyticsService;

export {
  // Track - Mutations
  capture,
  setEventTypeActive,

  // Track - Queries
  eventTypeBreakdown,
  topCatalogItems,
  trend,
  eventDetail,

  // Dashboard - Queries
  getAdminOverview,
  getCustomerOverview,

  // Constants
  EVENT_IDS,
  EVENT_DEFINITIONS,
  REPORT_DEFAULTS,
  REDIS,
};
