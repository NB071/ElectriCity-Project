// Order Service
// Adapter for email service integration

import { sendEmail, TEMPLATES } from "../email/email.service.js";
import log from "../../utils/logger.js";

/**
 * This adapter is the order service entry point to the email service.
 * @class
 */
class EmailAdaptor {
    /**
     * Sends an order confirmation email with detailed line items.
     * Failures are logged and swallowed so checkout completion is not blocked.
     * @param {object} input
     * @param {string} input.to Recipient email
     * @param {string} input.fname Recipient first name
     * @param {number|string} input.orderId Order ID
     * @param {{ name: string, quantity: number, price: number }[]} input.items Line items for the email template
     * @param {number} input.total Order total
     * @returns {Promise<{ jobId: string, queueName: string }|null>}
     */
    async sendOrderConfirmationEmail({ to, fname, orderId, items, total }) {
        try {
            return await sendEmail({
                to,
                template: TEMPLATES.ORDER_CONFIRM,
                vars: {
                    fname,
                    orderId: String(orderId),
                    items,
                    total: Number(total),
                },
            });
        } catch (err) {
            log.error(
                "Order",
                "sendOrderConfirmationEmail",
                "failed to enqueue order confirmation email",
                err,
            );
            return null;
        }
    }
}

const emailAdaptor = new EmailAdaptor();
export default emailAdaptor;
