import nodemailer from "nodemailer";
import { env, isEmailConfigured } from "../config/env.js";
import { ApiError } from "./ApiError.js";

let transporter;

const getTransporter = () => {
  if (!isEmailConfigured()) {
    throw new ApiError(503, "Email is not configured on this server.");
  }
  if (!transporter) {
    const { host, port, user, pass } = env.EMAIL;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: env.isProd && port !== 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
};

/** Call once at startup to log whether SMTP credentials work. Never throws. */
export const verifyMailer = async () => {
  if (!isEmailConfigured()) return { ok: false, reason: "not configured" };
  try {
    await getTransporter().verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
};

export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!to || !subject || !html || !text) throw new Error("to, subject, html and text are required");
  return getTransporter().sendMail({ from: env.EMAIL.from, to, subject, html, text, replyTo });
};

export default sendEmail;
