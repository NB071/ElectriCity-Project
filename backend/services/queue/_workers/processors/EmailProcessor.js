// Email Job Processor | Queue Service
// Processes email jobs by building and sending emails
import emailDirector from "../../../email/EmailDirector.js";
import smtpClient from "../../../email/SMTPClient.js";

/**
 * This function is used to build + send emails (used by worker).
 * @param {object} payload
 * @param {string} payload.to
 * @param {string} payload.template
 * @param {object} payload.vars
 * @returns {Promise<void>}
 */
async function processEmailJob({ to, template, vars }) {
    // Build the email by the email director.
    const { to: recipient, template: built } = emailDirector.direct({
        to,
        template,
        vars,
    });
    // Build the mail options & send the email.
    const mailOptions = smtpClient.buildMailOptions(recipient, built);
    return smtpClient.sendMail(mailOptions);
}

export default processEmailJob;
