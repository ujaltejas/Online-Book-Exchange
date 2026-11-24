// Runs without MongoDB: the model layer is stubbed so we can check the HTTP behaviour and security rules.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

process.env.JWT_SECRET = "x".repeat(48);
process.env.CLIENT_URL = "http://localhost:5173";

const { default: app } = await import("../src/app.js");
const { default: User } = await import("../src/models/user.model.js");
const { default: Book } = await import("../src/models/book.model.js");
const { rateLimit } = await import("../src/middlewares/rateLimit.js");
const { publicBook } = await import("../src/utils/serializers.js");
const { contactOwnerEmail } = await import("../src/utils/emailTemplates.js");
const { escapeRegex, isObjectId, toInt, clean } = await import("../src/utils/validate.js");
const { signToken } = await import("../src/utils/jwt.js");

let server;
let base;
before(() => new Promise((resolve) => {
  server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; resolve(); });
}));
after(() => server.close());

const json = (path, body, init = {}) =>
  fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), ...init });

test("health check", async () => {
  const res = await fetch(base + "/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-powered-by"), null);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
});

test("unknown routes return JSON 404", async () => {
  const res = await fetch(base + "/api/nope");
  assert.equal(res.status, 404);
  assert.ok((await res.json()).message);
});

test("protected routes reject missing and forged tokens", async () => {
  for (const path of ["/api/auth/me", "/api/post/mine", "/api/admin/users", "/api/admin/report"]) {
    assert.equal((await fetch(base + path)).status, 401, path);
  }
  const res = await fetch(base + "/api/auth/me", { headers: { Cookie: "token=not.a.jwt" } });
  assert.equal(res.status, 401);
});

test("contact endpoint now requires sign-in", async () => {
  const res = await json("/api/post/64b7f0f0f0f0f0f0f0f0f0f0/contact", { message: "hello there friend" });
  assert.equal(res.status, 401);
});

test("a valid token for a deleted user gets 401, not a 500", async () => {
  const original = User.findById;
  User.findById = async () => null;
  try {
    const res = await fetch(base + "/api/post/mine", { headers: { Cookie: `token=${signToken("64b7f0f0f0f0f0f0f0f0f0f0")}` } });
    assert.equal(res.status, 401);
  } finally { User.findById = original; }
});

test("non-admins are blocked from admin routes", async () => {
  const original = User.findById;
  User.findById = async () => ({ _id: "64b7f0f0f0f0f0f0f0f0f0f0", role: "user" });
  try {
    const res = await fetch(base + "/api/admin/users", { headers: { Cookie: `token=${signToken("64b7f0f0f0f0f0f0f0f0f0f0")}` } });
    assert.equal(res.status, 403);
  } finally { User.findById = original; }
});

test("register validates input before touching the database", async () => {
  assert.equal((await json("/api/auth/register", { username: "a", email: "x@y.co", password: "longenough" })).status, 400);
  assert.equal((await json("/api/auth/register", { username: "Alice", email: "bad", password: "longenough" })).status, 400);
  assert.equal((await json("/api/auth/register", { username: "Alice", email: "a@b.co", password: "short" })).status, 400);
  assert.equal((await json("/api/auth/register", { username: "Alice", email: "a@b.co", password: { $ne: 1 } })).status, 400);
});

test("register ignores a client-supplied role (privilege escalation fix)", async () => {
  const origExists = User.exists, origCreate = User.create;
  let saved;
  User.exists = async () => false;
  User.create = async (doc) => { saved = doc; return { _id: "64b7f0f0f0f0f0f0f0f0f0f0", ...doc, role: doc.role || "user" }; };
  try {
    const res = await json("/api/auth/register", { username: "Mallory", email: "Mallory@Example.com", password: "longenough", role: "admin" });
    assert.equal(res.status, 201);
    assert.equal(saved.role, undefined, "role must not be passed through");
    assert.equal(saved.email, "mallory@example.com", "email is normalised");
    const body = await res.json();
    assert.equal(body.user.role, "user");
    assert.equal(body.user.password, undefined);
    assert.match(res.headers.get("set-cookie"), /token=.*HttpOnly/i);
  } finally { User.exists = origExists; User.create = origCreate; }
});

test("login never returns the password hash and uses a generic error", async () => {
  const hash = await (await import("bcrypt")).default.hash("rightpassword", 4);
  const origFind = User.findOne;
  User.findOne = () => ({ select: async () => ({ _id: "64b7f0f0f0f0f0f0f0f0f0f0", username: "A", email: "a@b.co", role: "user", password: hash, comparePassword: (p) => require_bcrypt(p, hash) }) });
  const require_bcrypt = (await import("bcrypt")).default.compare;
  try {
    const ok = await json("/api/auth/login", { email: "a@b.co", password: "rightpassword" });
    assert.equal(ok.status, 200);
    const body = await ok.json();
    assert.equal(JSON.stringify(body).includes(hash), false);
    const bad = await json("/api/auth/login", { email: "a@b.co", password: "wrongpassword" });
    assert.equal(bad.status, 401);
    User.findOne = () => ({ select: async () => null });
    const unknown = await json("/api/auth/login", { email: "who@b.co", password: "whatever12" });
    assert.equal(unknown.status, 401);
    assert.equal((await unknown.json()).message, (await bad.json()).message);
  } finally { User.findOne = origFind; }
});

test("uploads reject non-image files", async () => {
  const form = new FormData();
  form.append("username", "Alice"); form.append("email", "a@b.co"); form.append("password", "longenough");
  form.append("image", new Blob(["#!/bin/sh"], { type: "application/x-sh" }), "x.sh");
  const res = await fetch(base + "/api/auth/register", { method: "POST", body: form });
  assert.equal(res.status, 400);
  assert.match((await res.json()).message, /JPG, PNG or WebP/);
});

test("malformed JSON gets a 400", async () => {
  const res = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad" });
  assert.equal(res.status, 400);
});

test("book search blocks operator injection and caps the page size", async () => {
  const orig = { find: Book.find, count: Book.countDocuments };
  let filter, limit, sort;
  const chain = { populate() { return this; }, sort(s) { sort = s; return this; }, skip() { return this; }, limit(l) { limit = l; return Promise.resolve([]); } };
  Book.find = (f) => { filter = f; return chain; };
  Book.countDocuments = async () => 0;
  try {
    const res = await fetch(base + "/api/post?category[$ne]=x&condition=Good&university[$gt]=&limit=99999&sort=owner.password&status=reserved&excludeOwner[$ne]=1");
    assert.equal(res.status, 200);
    assert.equal(filter.category, undefined, "operator object must be dropped");
    assert.equal(filter.condition, "Good");
    assert.equal(filter.status, "reserved");
    assert.equal(filter.owner, undefined);
    assert.equal(limit, 50);
    assert.equal(sort, "-createdAt", "unknown sort falls back to newest");
    const body = await res.json();
    assert.equal(body.totalPages, 1);
  } finally { Book.find = orig.find; Book.countDocuments = orig.count; }
});

test("book payloads never include the owner's email", () => {
  const out = publicBook({
    _id: "1", title: "T", author: "A", owner: { _id: "2", username: "bob", email: "bob@secret.com", avatar: "" },
    images: [{ _id: "i", url: "u", public_id: "private-id" }],
  });
  const text = JSON.stringify(out);
  assert.equal(text.includes("bob@secret.com"), false);
  assert.equal(text.includes("private-id"), false);
  assert.equal(out.status, "available");
});

test("contact email escapes user content and strips header newlines", () => {
  const mail = contactOwnerEmail({
    owner: { username: "Own<er>" },
    book: { title: "Evil\r\nBcc: x@y.z", author: "A", category: "Law", condition: "Good", university: "U", college: "C", exchangeType: "free" },
    requester: { username: "<script>alert(1)</script>", email: "r@x.co" },
    phone: "", message: "hi <img src=x onerror=1>\nline2",
  });
  assert.equal(/[\r\n]/.test(mail.subject), false);
  assert.equal(mail.html.includes("<script>"), false);
  assert.equal(mail.html.includes("<img"), false);
  assert.ok(mail.text.includes("Phone: Not provided"));
});

test("rate limiter blocks after max and sets Retry-After", async () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 2, key: () => "k" });
  const run = () => { const r = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json() { return this; } }; let passed = false; limiter({ ip: "1" }, r, () => { passed = true; }); return { passed, r }; };
  assert.equal(run().passed, true);
  assert.equal(run().passed, true);
  const third = run();
  assert.equal(third.passed, false);
  assert.equal(third.r.code, 429);
  assert.ok(third.r.headers["Retry-After"]);
});

test("validators", () => {
  assert.equal(escapeRegex("a.b(c)"), "a\\.b\\(c\\)");
  assert.equal(isObjectId("64b7f0f0f0f0f0f0f0f0f0f0"), true);
  assert.equal(isObjectId({ $ne: 1 }), false);
  assert.equal(toInt("abc", 5, 1, 10), 5);
  assert.equal(toInt("999", 5, 1, 10), 10);
  assert.equal(clean({ a: 1 }), "");
  assert.equal(clean("  hi  "), "hi");
});
