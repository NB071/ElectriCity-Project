// Payment Service (Facade)

import {
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
    getPaymentAttemptById,
    getPaymentAttemptsByOrderId,
    getPaymentAttemptsByUserId,
    processPayment,
    recordPaymentAttempt,
    updateOrderPaymentStatus,
    VALIDATIONS,
};

export default paymentService;

export {
    // Queries
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
