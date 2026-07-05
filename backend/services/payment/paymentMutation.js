// Payment Service
// CQRS - Mutation side (writes)

import getStrategy from "./strategies/index.js";
import toPaymentResultDTO from "./DTOs/paymentResultDTO.js";
import { validateProcessPaymentInput } from "./paymentValidator.js";
import paymentDAO from "./paymentDAO.js";
import { VALIDATIONS } from "./constants.js";

/**
 * This function processes a payment for an order.
 * user_id must come from req.user.user_id, not the request body.
 * Delegates gateway logic to the payment method strategy.
 * Records a payment_attempt and updates orders.payment_status on success.
 * @requiredRole customer
 * @param {object} input
 * @param {number} input.user_id
 * @param {number} input.order_id
 * @param {number} input.amount
 * @param {string} input.payment_method
 * @param {object} [input.payment_details] Gateway specific payload (card token, etc.)
 * @returns {Promise<object>} Payment result with attempt_id and status
 * @throws {Error} If validation fails or payment processing fails
 */
async function processPayment({user_id, order_id, amount, payment_method, payment_details}) {
    try{
        const validate = validateProcessPaymentInput({user_id, order_id, amount, payment_method, payment_details})
        const strategy = getStrategy(validate.payment_method);
        const strategyProcess = strategy.process({
            user_id: validate.user_id,
            order_id: validate.order_id,
            amount: validate.amount,
            payment_method: validate.payment_method,
            payment_details: validate.payment_details
        })

        const insertPayment = await paymentDAO.insertPaymentAttempt({
            order_id: validate.order_id,
            user_id: validate.user_id,
            amount: validate.amount,
            payment_method: validate.payment_method,
            status: strategyProcess.status,
        })
        
        if(strategyProcess.status === VALIDATIONS.ATTEMPT_STATUS.SUCCESS){
            await paymentDAO.updateOrderPaymentStatus(
                validate.order_id,
                VALIDATIONS.ORDER_PAYMENT_STATUS.PAID,
            )
        }
        else{
            await paymentDAO.updateOrderPaymentStatus(
                validate.order_id,
                VALIDATIONS.ORDER_PAYMENT_STATUS.FAILED
            )
        }
        return ({attempt_id : insertPayment, status : strategyProcess.status})
    } 
    catch(err){
        console.error("[Service: Payment] processPayment failed:", err.message);
        throw err;
    }   
}

/**
 * This function records a payment attempt without running the gateway.
 * @requiredRole customer
 * @param {object} input
 * @param {number} input.order_id
 * @param {number} input.user_id
 * @param {number} input.amount
 * @param {string} input.payment_method
 * @param {string} input.status
 * @returns {Promise<{ attempt_id: number }>}
 * @throws {Error} If validation fails or the insert fails
 */
async function recordPaymentAttempt({order_id,user_id,amount,payment_method,status,}) {
    try{
        const validate = validatePaymentAttemptInput({user_id, order_id, amount, payment_method, status})
        const row = await paymentDAO.insertPaymentAttempt({
            order_id: validate.order_id,
            user_id: validate.user_id,
            amount: validate.amount,
            payment_method: validate.payment_method,
            status: validate.status,
        });
        return row;
    }
    catch(err){
        console.error("[Service: Payment] recordPaymentAttempt failed:", err.message);
        throw err;
    }
    
}

/**
 * This function updates an order's payment_status.
 * @requiredRole admin
 * @param {number|string} order_id
 * @param {string} payment_status Value from VALIDATIONS.ORDER_PAYMENT_STATUS
 * @returns {Promise<void>}
 * @throws {Error} If validation fails or the update fails
 */
async function updateOrderPaymentStatus(order_id, payment_status) {
    try{

    }
    catch(err){
        console.error("[Service: Payment] updateOrderPaymentStatus failed:", err.message);
        throw err;
    }
}

export { processPayment, recordPaymentAttempt, updateOrderPaymentStatus };
