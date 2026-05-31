// Email Service
/* Assumption(s):
 * Email provider (Gmail) has internal queue for sending emails (prevent missed emails)
 */
import env from "../../configs/env.js";
import configureTransporter from "../../configs/mail.js";
import EmailTemplateBuilder from "./emailBuilder.js";

// Instantiation
const transporter = await configureTransporter();
const emailTemplateBuilder = new EmailTemplateBuilder();

// ---- Helper Functions ----
// generate mail options for sending email
function generateMailOptions(recipient, template) {
    // Guard
    if (!recipient || !template) {
        throw new Error("Missing required parameters");
    }

    return {
        from: env.email.from,
        to: recipient,
        subject: template.subject,
        html: template.generateHtml(),
    };
}

// ---- Email Sending Functions ----
// send welcome email to user after registration
// user is an object: { fname: string, email: string }
async function sendWelcomeEmail(user) {
    try {
        const { fname, email } = user;

        const emailTemplate = emailTemplateBuilder
            .setRecipient(email)
            .setSubject(`Welcome to our platform!`)
            .setHeaderText(`Welcome - ${fname}!`)
            .addBodyParagraph("We are so excided to have you on board!")
            .addBodyParagraph(
                "Please feel free to contact us if you have any questions.",
            )
            .setCTA("Visit Dashboard", "https://TBD/dashboard")
            .build();

        const mailOptions = generateMailOptions(email, emailTemplate);

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

// send order confirmation email to user after order is placed
// order is an object: { order_id: string, order_date: string, order_total: number, order_items: array }
// user is an object: { fname: string, email: string }
async function sendOrderConfirmationEmail(order, user) {
    try {
        const { order_id, order_date, order_total, order_items } = order;
        const { fname, email } = user;

        const emailTemplate = emailTemplateBuilder
            .setRecipient(email)
            .setSubject(`Order Confirmation - #${order_id}`)
            .setHeaderText(`Thank you for your order!`)
            .addBodyParagraph(`Hello ${fname},`)
            .addBodyParagraph(`Your order has been placed successfully.`)
            .addBodyParagraph(`Order ID: ${order_id}`)
            .addBodyParagraph(`Order Date: ${order_date}`)
            .addBodyParagraph(`Order Total: $${order_total}`)
            .addBodyParagraph(
                `Order Items: ${order_items.map((item) => item.name).join(", ")}`,
            )
            .setCTA("View Order", `https://TBD/dashboard/orders/${order_id}`)
            .build();

        const mailOptions = generateMailOptions(email, emailTemplate);

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
        throw error;
    }
}

// send account deletion email to user after account is deleted
// user is an object: { fname: string, email: string }
async function sendAccountDeletionEmail(user) {
    try {
        const { fname, email } = user;

        const emailTemplate = emailTemplateBuilder
            .setRecipient(email)
            .setSubject(`Account Deletion Confirmation`)
            .setHeaderText(`Account Deletion - ${fname}`)
            .addBodyParagraph(`Sad to see you go, ${fname}.`)
            .addBodyParagraph(`Your account has been deleted successfully.`)
            .addBodyParagraph(`If you have any questions, please contact us.`)
            .setCTA("Contact Us", "https://TBD/contact")
            .build();

        const mailOptions = generateMailOptions(email, emailTemplate);

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending account deletion email:", error);
        throw error;
    }
}
// ---- Export Functions ----
export {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendAccountDeletionEmail,
};
