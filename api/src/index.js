import mongoose from "mongoose";
import { env, validateEnv } from "./config/env.js";
import app from "./app.js";
import { verifyMailer } from "./utils/sendEmail.js";

const { problems, warnings } = validateEnv();
warnings.forEach((w) => console.warn(`[config] ${w}`));
if (problems.length) {
  problems.forEach((p) => console.error(`[config] ${p}`));
  process.exit(1);
}

try {
  await mongoose.connect(env.MONGODB_URI);
  console.log(`[db] connected to ${mongoose.connection.name}`);
} catch (err) {
  console.error(`[db] connection failed: ${err.message}`);
  process.exit(1);
}

const server = app.listen(env.PORT, async () => {
  console.log(`[api] listening on http://localhost:${env.PORT}`);
  const mail = await verifyMailer();
  console.log(mail.ok ? "[mail] SMTP connection verified" : `[mail] not ready: ${mail.reason}`);
});

const shutdown = () => server.close(() => mongoose.connection.close().then(() => process.exit(0)));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
