// IAM Identity Management
// Adapter for email service integration

import { sendEmail, TEMPLATES } from "../email/email.service.js";

/**
 * This adapter is the only email entry point to the email service.
 * @class
 */
class EmailAdapter {
    /**
     * This method sends an account deletion email.
     * @param {string} userEmail
     * @param {string} fname
     * @returns {Promise<void>}
     * @throws {ValidationError} If the email data is invalid.
     */
    async sendAccountDeletionEmail(userEmail, fname) {
        return sendEmail({
            to: userEmail,
            template: TEMPLATES.ACCOUNT_DELETION,
            vars: { fname },
        });
    }
}

const emailAdapter = new EmailAdapter();
export default emailAdapter;
