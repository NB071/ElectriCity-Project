// Email Template Generation
// Design Pattern / Technique: Builder / Object-Oriented Programming (OOP)

// This class generates the HTML for an email template
class EmailTemplate {
    static EMAIL_SUBJECT_PREFIX = "Electricity: ";
    static DEFAULT_FOOTER_TEXT = "Best regards, EECS 4413 Group G.";

    constructor() {
        this.recipient = "";
        this.subject = "";
        this.headerText = "";
        this.footerText = EmailTemplate.DEFAULT_FOOTER_TEXT;
        this.body = [];
        this.ctaText = "";
        this.ctaUrl = "";
    }

    setSubject(subjectText = "") {
        if (subjectText === "") {
            this.subject = `${EmailTemplate.EMAIL_SUBJECT_PREFIX}Email Update`;
        } else {
            this.subject = `${EmailTemplate.EMAIL_SUBJECT_PREFIX}${subjectText}`;
        }
        return this;
    }

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

class EmailTemplateBuilder {
    constructor() {
        this.reset();
    }

    setRecipient(recipient) {
        this.template.recipient = recipient;
        return this;
    }

    setSubject(subject) {
        this.template.setSubject(subject);
        return this;
    }

    setHeaderText(headerText) {
        this.template.headerText = headerText;
        return this;
    }

    setFooterText(footerText) {
        this.template.footerText = footerText;
        return this;
    }

    addBodyParagraph(paragraph) {
        this.template.body.push(paragraph);
        return this;
    }

    setCTA(ctaText, ctaUrl) {
        this.template.ctaText = ctaText;
        this.template.ctaUrl = ctaUrl;
        return this;
    }

    reset() {
        this.template = new EmailTemplate();
        return this;
    }

    build() {
        const result = this.template;
        this.reset();
        return result;
    }
}

export default EmailTemplateBuilder;
