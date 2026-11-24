import { escapeHtml } from "./validate.js";

const oneLine = (s) => String(s).replace(/[\r\n]+/g, " ");

export const contactOwnerEmail = ({ owner, book, requester, phone, message }) => {
  const typeLabel = book.exchangeType === "free" ? "Free / donation" : "Exchange";
  const subject = oneLine(`Someone is interested in "${book.title}"`).slice(0, 150);

  const text = [
    `Hi ${owner.username},`,
    ``,
    `${requester.username} is interested in your listing on BookSwap.`,
    ``,
    `Book: ${book.title} by ${book.author}`,
    `Category: ${book.category}`,
    `Condition: ${book.condition}`,
    `Campus: ${book.university}, ${book.college}`,
    `Type: ${typeLabel}`,
    ``,
    `From: ${requester.username} <${requester.email}>`,
    `Phone: ${phone || "Not provided"}`,
    ``,
    `Message:`,
    message,
    ``,
    `Reply to this email to reach ${requester.username} directly.`,
    `BookSwap never handles payments. Arrange the handover yourselves.`,
  ].join("\n");

  const row = (label, value) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#4a5b52">${label}</td><td style="padding:4px 0"><strong>${escapeHtml(value)}</strong></td></tr>`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#15281f;max-width:560px;margin:0 auto">
    <h2 style="margin:0 0 8px;color:#1f5c47">Someone is interested in your book</h2>
    <p>Hi ${escapeHtml(owner.username)}, <strong>${escapeHtml(requester.username)}</strong> sent you a message about your listing.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      ${row("Book", `${book.title} by ${book.author}`)}
      ${row("Category", book.category)}
      ${row("Condition", book.condition)}
      ${row("Campus", `${book.university}, ${book.college}`)}
      ${row("Type", typeLabel)}
    </table>
    <h3 style="margin:16px 0 4px">Their details</h3>
    <p style="margin:0">${escapeHtml(requester.username)} &lt;${escapeHtml(requester.email)}&gt;<br>Phone: ${escapeHtml(phone || "Not provided")}</p>
    <h3 style="margin:16px 0 4px">Message</h3>
    <p style="margin:0;padding:12px;background:#e3ece6;border-radius:6px">${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    <p style="margin-top:20px;color:#4a5b52;font-size:14px">Reply to this email to reach ${escapeHtml(requester.username)} directly. BookSwap never handles payments; arrange the handover yourselves.</p>
  </div>`;

  return { subject, html, text };
};
