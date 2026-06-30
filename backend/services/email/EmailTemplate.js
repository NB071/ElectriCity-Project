import { DEFAULTS } from "./constants.js";

/**
 * This class generates the HTML for an email template.
 * @class
 */
class EmailTemplate {

    /**
     * This constructor creates a new EmailTemplate instance.
     * @constructor
     */
    constructor() {
        this.recipient = "";
        this.subject = "";
        this.headerText = "";
        this.footerText = DEFAULTS.FOOTER_TEXT;
        this.body = [];
        this.ctaText = "";
        this.ctaUrl = "";
    }

    /**
     * This method sets the subject of the email.
     * @param {string} subjectText The subject of the email.
     * @returns {EmailTemplate} The email template.
     */
    setSubject(subjectText = "") {
        if (subjectText === "") {
            this.subject = `${DEFAULTS.SUBJECT_PREFIX}${DEFAULTS.FALLBACK_SUBJECT}`;
        } else {
            this.subject = `${DEFAULTS.SUBJECT_PREFIX}${subjectText}`;
        }
        return this;
    }

    /**
     * This method generates the HTML for the email template.
     * @returns {string} The HTML for the email template.
     */
    generateHtml() {
        return `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <style>
                  /* Global styles to be added later */
                </style>
              </head>
              <body>
                <div>
                  <div>
                    <h2>${this.headerText}</h2>
                  </div>
                  <div>
                    ${this.body
                        .map(
                            (paragraph) => `
                    <p>${paragraph}</p>
                    `,
                        )
                        .join("")} ${
                        this.ctaUrl
                            ? `
                    <p>
                      <a href="${this.ctaUrl}">${this.ctaText}</a>
                    </p>
                    `
                            : ""
                    }
                  </div>
                  <div>
                    <p>${this.footerText}</p>
                  </div>
                </div>
              </body>
            </html>
            `;
    }
}

export default EmailTemplate;
