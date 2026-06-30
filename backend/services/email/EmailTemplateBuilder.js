// Email Template Generation
// Design Pattern / Technique: Builder / Object-Oriented Programming (OOP)

import EmailTemplate from "./EmailTemplate.js";

/**
 * This class builds the email template.
 * @class
 */
class EmailTemplateBuilder {
    /**
     * This constructor creates a new EmailTemplateBuilder instance.
     * @constructor
     */
    constructor() {
        this.reset();
    }

    /**
     * This method sets the recipient of the email.
     * @param {string} recipient The recipient of the email.
     * @returns {EmailTemplateBuilder} The email template builder.
     */
    setRecipient(recipient) {
        this.template.recipient = recipient;
        return this;
    }

    /**
     * This method sets the subject of the email.
     * @param {string} subject The subject of the email.
     * @returns {EmailTemplateBuilder} The email template builder.
     */
    setSubject(subject) {
        this.template.setSubject(subject);
        return this;
    }

    /**
     * This method sets the header text of the email.
     * @param {string} headerText The header text of the email.
     * @returns {EmailTemplateBuilder} The email template builder.
     */
    setHeaderText(headerText) {
        this.template.headerText = headerText;
        return this;
    }

    /**
     * This method sets the footer text of the email.
     * @param {string} footerText The footer text of the email.
     * @returns {EmailTemplateBuilder} The email template builder.
     */
    setFooterText(footerText) {
        this.template.footerText = footerText;
        return this;
    }

    /**
     * This method adds a body paragraph to the email.
     * @param {string} paragraph The body paragraph of the email.
     * @returns {EmailTemplateBuilder} The email template builder.
     */
    addBodyParagraph(paragraph) {
        this.template.body.push(paragraph);
        return this;
    }

    /**
     * This method sets the call to action text and URL of the email.
     * @param {string} ctaText The call to action text of the email.
     * @param {string} ctaUrl The call to action URL of the email.
     * @returns {EmailTemplateBuilder} The email template builder.
     */
    setCTA(ctaText, ctaUrl) {
        this.template.ctaText = ctaText;
        this.template.ctaUrl = ctaUrl;
        return this;
    }

    /**
     * This method resets the email template builder.
     * @returns {EmailTemplateBuilder} The email template builder.
     */
    reset() {
        this.template = new EmailTemplate();
        return this;
    }

    /**
     * This method builds the email template.
     * @returns {EmailTemplate} The email template.
     */
    build() {
        const result = this.template;
        this.reset();
        return result;
    }
}

export default EmailTemplateBuilder;
