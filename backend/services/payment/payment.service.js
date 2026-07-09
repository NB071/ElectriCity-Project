// Payment Service (Facade)

import {
    viewAllPaymentAttempts,
    getPaymentAttemptById,
    getPaymentAttemptsByOrderId,
    getPaymentAttemptsByUserId,
} from "./paymentQuery.js";
import {
    processPayment,
    recordPaymentAttempt,
    updateOrderPaymentStatus,
} from "./paymentMutation.js";
import { VALIDATIONS } from "./constants.js";

const paymentService = {
    // Queries
    viewAllPaymentAttempts,
    getPaymentAttemptById,
    getPaymentAttemptsByOrderId,
    getPaymentAttemptsByUserId,

    // Mutations
    processPayment,
    recordPaymentAttempt,
    updateOrderPaymentStatus,

    // Constants
    VALIDATIONS,
};

export default paymentService;

export {
    // Queries
    viewAllPaymentAttempts,
    getPaymentAttemptById,
    getPaymentAttemptsByOrderId,
    getPaymentAttemptsByUserId,

    // Mutations
    processPayment,
    recordPaymentAttempt,
    updateOrderPaymentStatus,

    // Constants
    VALIDATIONS,
};
