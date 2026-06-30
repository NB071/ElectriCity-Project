// SMTP Client: interaction and usage only. Config lives in configs/mail.js
// Design Pattern: Singleton
import configureTransporter, { mailConfig } from "../../configs/mail.js";

/**
 * This class is used to send emails.
 * @class
 */
class SMTPClient {
    static #instance;

    #transporter = null;

    /**
     * This constructor creates a new SMTPClient instance.
     * @constructor
     */
    constructor() {
        if (SMTPClient.#instance) {
            return SMTPClient.#instance;
        }
        SMTPClient.#instance = this;
    }

    /**
     * This method ensures the transporter is created.
     * @returns {Promise<Transporter>} The transporter.
     */
    async #ensureTransporter() {
        if (this.#transporter) {
            return this.#transporter;
        }

        this.#transporter = await configureTransporter();
        return this.#transporter;
    }

    /**
     * This method connects to the SMTP server.
     * @returns {Promise<Transporter>} The transporter.
     */
    async connect() {
        return this.#ensureTransporter();
    }

    /**
     * This method builds the mail options.
     * @param {string} recipient The recipient of the email.
     * @param {EmailTemplate} template The email template.
     * @returns {object} The mail options.
     */
    buildMailOptions(recipient, template) {
        if (!recipient || !template) {
            throw new Error("Missing required parameters");
        }

        return {
            from: mailConfig.from,
            to: recipient,
            subject: template.subject,
            html: template.generateHtml(),
        };
    }

    /**
     * This method sends the email.
     * @param {object} mailOptions The mail options.
     * @returns {Promise<object>} The email info.
     */
    async sendMail(mailOptions) {
        const transporter = await this.#ensureTransporter();
        const info = await transporter.sendMail(mailOptions);
        return info;
    }
}

const smtpClient = new SMTPClient();
await smtpClient.connect();

export default smtpClient;
