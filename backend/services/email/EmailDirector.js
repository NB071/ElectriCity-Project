// Email Director
// Design Pattern: Director
import EmailTemplateBuilder from "./EmailTemplateBuilder.js";
import validateEmail from "./emailValidator.js";
import { ValidationError } from "../../utils/errors.js";
import {
    TEMPLATES,
    SUBJECTS,
    SUBJECT_PREFIX,
    CTA_LABELS,
    CTA_URLS,
} from "./constants.js";

/**
 * This class is used to direct the email building process.
 * @class
 */
class EmailDirector {
    #builder;

    /**
     * This constructor creates a new EmailTemplateBuilder instance.
     * @constructor
     */
    constructor() {
        this.#builder = new EmailTemplateBuilder();
    }

    /**
     * This method returns the subject of the email.
     * @param {string} template The template of the email.
     * @param {object} vars The variables of the email.
     * @returns {string} The subject of the email.
     * @throws {ValidationError} If the template is unknown.
     */
    #getSubject(template, vars) {
        switch (template) {
            case TEMPLATES.WELCOME:
                return SUBJECTS[TEMPLATES.WELCOME];
            case TEMPLATES.ORDER_CONFIRM:
                return `${SUBJECT_PREFIX.ORDER_CONFIRM}${vars.orderId}`;
            case TEMPLATES.ACCOUNT_DELETION:
                return SUBJECTS[TEMPLATES.ACCOUNT_DELETION];
            default:
                throw new ValidationError(`Unknown template: ${template}`);
        }
    }

    /**
     * This method builds the welcome email.
     * @param {string} to The recipient of the email.
     * @param {object} vars The variables of the email.
     * @returns {EmailTemplate} The welcome email.
     */
    #buildWelcome(to, { fname }) {
        return this.#builder
            .setRecipient(to)
            .setSubject(SUBJECTS[TEMPLATES.WELCOME])
            .setHeaderText(`Welcome - ${fname}!`)
            .addBodyParagraph("We are so excided to have you on board!")
            .addBodyParagraph(
                "Please feel free to contact us if you have any questions.",
            )
            .setCTA(CTA_LABELS.VISIT_DASHBOARD, CTA_URLS.DASHBOARD)
            .build();
    }

    /**
     * This method builds the order confirmation email.
     * @param {string} to The recipient of the email.
     * @param {object} vars The variables of the email.
     * @returns {EmailTemplate} The order confirmation email.
     */
    #buildOrderConfirm(to, { fname, orderId, items, total }) {
        const itemLines = items.map((item) => {
            const lineTotal = Number(item.quantity) * Number(item.price);
            return `${item.quantity} × ${item.name} @ $${Number(item.price).toFixed(2)} = $${lineTotal.toFixed(2)}`;
        });

        let builder = this.#builder
            .setRecipient(to)
            .setSubject(`${SUBJECT_PREFIX.ORDER_CONFIRM}${orderId}`)
            .setHeaderText("Thank you for your order!")
            .addBodyParagraph(`Hello ${fname},`)
            .addBodyParagraph("Your order has been placed successfully.")
            .addBodyParagraph(`Order ID: ${orderId}`)
            .addBodyParagraph("Order items:");

        for (const line of itemLines) {
            builder = builder.addBodyParagraph(line);
        }

        return builder
            .addBodyParagraph(`Order Total: $${Number(total).toFixed(2)}`)
            .setCTA(CTA_LABELS.VIEW_ORDER, CTA_URLS.order(orderId))
            .build();
    }

    /**
     * This method builds the account deletion email.
     * @param {string} to The recipient of the email.
     * @param {object} vars The variables of the email.
     * @returns {EmailTemplate} The account deletion email.
     */
    #buildAccountDeletion(to, { fname }) {
        return this.#builder
            .setRecipient(to)
            .setSubject(SUBJECTS[TEMPLATES.ACCOUNT_DELETION])
            .setHeaderText(`Account Deletion - ${fname}`)
            .addBodyParagraph(`Sad to see you go, ${fname}.`)
            .addBodyParagraph("Your account has been deleted successfully.")
            .addBodyParagraph("If you have any questions, please contact us.")
            .setCTA(CTA_LABELS.CONTACT_US, CTA_URLS.CONTACT)
            .build();
    }

    //
    /**
     * This method builds the email by template.
     * Note: New templates should also define a dedicated validator within emailValidator.js
     * @param {string} template The template of the email.
     * @param {string} to The recipient of the email.
     * @param {object} vars The variables of the email.
     * @returns {EmailTemplate} The email.
     * @throws {ValidationError} If the template is unknown.
     */
    #buildByTemplate(template, to, vars) {
        switch (template) {
            case TEMPLATES.WELCOME:
                return this.#buildWelcome(to, vars);
            case TEMPLATES.ORDER_CONFIRM:
                return this.#buildOrderConfirm(to, vars);
            case TEMPLATES.ACCOUNT_DELETION:
                return this.#buildAccountDeletion(to, vars);
            default:
                throw new ValidationError(`Unknown template: ${template}`);
        }
    }

    /**
     * This method directs the email building process.
     * @param {object} data The data of the email.
     * @param {string} data.to The recipient of the email.
     * @param {string} data.template The template of the email.
     * @param {object} data.vars The variables of the email.
     * @returns {EmailTemplate} The email.
     * @throws {ValidationError} If the template is unknown.
     */
    direct({ to, template, vars }) {
        const subject = this.#getSubject(template, vars);
        const validated = validateEmail({ to, template, vars, subject });
        const built = this.#buildByTemplate(
            validated.template,
            validated.to,
            validated.vars,
        );

        return { to: validated.to, template: built };
    }
}

export default new EmailDirector();
