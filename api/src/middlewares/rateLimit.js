/**
 * Small in-memory fixed-window rate limiter (no extra dependency).
 * It is per-process: if you run several server instances, swap in a shared store such as Redis.
 */
export const rateLimit = ({ windowMs, max, message, key }) => {
  const hits = new Map();
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  }, Math.max(windowMs, 60_000));
  sweep.unref();

  return (req, res, next) => {
    const id = key ? key(req) : req.ip;
    const now = Date.now();
    let entry = hits.get(id);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(id, entry);
    }
    entry.count += 1;
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
      return res.status(429).json({ message: message || "Too many requests. Please try again later." });
    }
    next();
  };
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many attempts. Please wait a few minutes and try again.",
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  key: (req) => `contact:${req.user?._id || req.ip}`,
  message: "You can send up to 5 messages per hour. Please try again later.",
});
