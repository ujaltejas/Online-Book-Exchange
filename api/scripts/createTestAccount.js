// One-off helper: prints throwaway Ethereal SMTP credentials for local email testing.
import nodemailer from "nodemailer";

const account = await nodemailer.createTestAccount();
console.log("Ethereal credentials (put these in api/.env):");
console.log("EMAIL_HOST=" + account.smtp.host);
console.log("EMAIL_PORT=" + account.smtp.port);
console.log("EMAIL_USER=" + account.user);
console.log("EMAIL_PASSWORD=" + account.pass);
