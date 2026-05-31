/* Resources used:
 * https://nodemailer.com/
 * https://mailtrap.io/blog/sending-emails-with-nodemailer/
 * https://medium.com/coox-tech/send-mail-using-node-js-express-js-with-nodemailer-93f4d62c83ee
 */
import nodemailer from "nodemailer";
import env from "./env.js";

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

        console.log("Nodemailer transporter configured successfully");

        return transporter;
    } catch (error) {
        console.error("Error configuring Nodemailer transporter:", error);
        throw error;
    }
}

export default configureTransporter;
