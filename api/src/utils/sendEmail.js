import nodemailer from "nodemailer";

const requiredEmailEnv = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASSWORD"];

const validateEmailConfig = () => {
  const missing = requiredEmailEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing email configuration: ${missing.join(", ")}`);
  }
};

const createTransporter = () => {
  validateEmailConfig();

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendEmail = async ({ to, subject, html, replyTo }) => {
  if (!to || !subject || !html) {
    throw new Error("Email receiver, subject and html body are required");
  }

  const transporter = createTransporter();

  return transporter.sendMail({
    from: '"Online Book Exchange" <noreply@bookexchange.local>',
    to,
    subject,
    html,
    replyTo,
  });
};

export default sendEmail;
