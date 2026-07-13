// Order Service (Facade)

import {
    ensureOrderExists,
    validateOrderForPayment,
    listOrdersByUserId,
    getOrderDetailsForUser,
    listAllOrders,
    getOrderDetailsForAdmin,
} from "./orderQuery.js";
import {
    updatePaymentStatus,
    updateOrderStatus,
    checkout,
} from "./orderMutation.js";
import {
    VALIDATIONS,
    DEFAULTS,
    CHECKOUT_ACTORS,
    TAX_RATES_BY_PROVINCE,
} from "./constants.js";

const orderService = {
    // Queries
    ensureOrderExists,
    validateOrderForPayment,
    listOrdersByUserId,
    getOrderDetailsForUser,
    listAllOrders,
    getOrderDetailsForAdmin,

    // Mutations
    updatePaymentStatus,
    updateOrderStatus,
    checkout,

    // Constants
    VALIDATIONS,
    DEFAULTS,
    CHECKOUT_ACTORS,
    TAX_RATES_BY_PROVINCE,
};

export default orderService;

export {
    // Queries
    ensureOrderExists,
    validateOrderForPayment,
    listOrdersByUserId,
    getOrderDetailsForUser,
    listAllOrders,
    getOrderDetailsForAdmin,

    // Mutations
    updatePaymentStatus,
    updateOrderStatus,
    checkout,

    // Constants
    VALIDATIONS,
    DEFAULTS,
    CHECKOUT_ACTORS,
    TAX_RATES_BY_PROVINCE,
};
