// Order Service (Facade)

import { ensureOrderExists, validateOrderForPayment } from "./orderQuery.js";
import { updatePaymentStatus } from "./orderMutation.js";
import { VALIDATIONS } from "./constants.js";

const orderService = {
    ensureOrderExists,
    validateOrderForPayment,
    updatePaymentStatus,
    VALIDATIONS,
};

export default orderService;

export {
    ensureOrderExists,
    validateOrderForPayment,
    updatePaymentStatus,
    VALIDATIONS,
};
