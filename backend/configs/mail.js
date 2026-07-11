/* Resources used:
 * https://nodemailer.com/
 * https://mailtrap.io/blog/sending-emails-with-nodemailer/
 * https://medium.com/coox-tech/send-mail-using-node-js-express-js-with-nodemailer-93f4d62c83ee
 */
import nodemailer from "nodemailer";
import env from "./env.js";
import log from "../utils/logger.js";

export const mailConfig = {
    from: env.email.from,
};

async function configureTransporter() {
    try {
        const transporter = nodemailer.createTransport({
            host: env.email.host,
            port: Number(env.email.port),
            secure: env.email.secure === "true",
            auth: {
                user: env.email.user,
                pass: env.email.pass,
            },
        });

        log.info("Mail", "configureTransporter", "Nodemailer transporter configured successfully");

        return transporter;
    } catch (error) {
        log.error(
            "Mail",
            "configureTransporter",
            "Error configuring Nodemailer transporter",
            error,
        );
        throw error;
    }
}

export default configureTransporter;
