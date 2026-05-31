// Inspired by: https://github.com/GonzaloHirsch/jwt-nodejs-security/blob/main/src/config/index.ts

/* 
This file loads environment variables from .env file and 
exports them as an object to facilitate/standardize access.
*/

import dotenv from "dotenv";
dotenv.config();

export default {
    db: {
        DB_HOST: process.env.DB_HOST,
        DB_LOCAL_DBNAME: process.env.DB_LOCAL_DBNAME,
        DB_LOCAL_USER: process.env.DB_LOCAL_USER,
        DB_LOCAL_PASSWORD: process.env.DB_LOCAL_PASSWORD,
    },
    jwt: {
        JWT_SIGN_KEY: process.env.JWT_SIGN_KEY,
    },
    server: {
        PORT: process.env.PORT,
        LOCAL_ADDRESS: process.env.LOCAL_ADDRESS,
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM,
        secure: process.env.SMTP_SECURE,
    },
};
