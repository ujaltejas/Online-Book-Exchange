# BookSwap

Students swap or give away academic books on campus. List a book, get a message by email, hand it over in person. No payments.

**Stack:** React 19 + Vite + Tailwind 4 + Zustand (client) and Express + MongoDB + Cloudinary + Nodemailer (API).

## Quick start

Requires Node 20+ and a MongoDB instance (local or Atlas).

```bash
npm run install:all          # installs root, api and client dependencies

cp api/.env.example api/.env       # then fill it in (see below)
cp client/.env.example client/.env

npm run dev                  # API on :3000, client on :5173
```

### Create the first admin

Nobody can register as an admin. Promote (or create) one from the command line:

```bash
cd api
ADMIN_PASSWORD="at-least-8-chars" npm run seed:admin -- you@example.com "Your Name"
```

### Environment variables (`api/.env`)

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | **Required.** 32+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `MONGODB_URI` | Mongo connection string, including the database name |
| `CLIENT_URL` | Allowed browser origin(s), comma separated |
| `COOKIE_SAMESITE` | `lax` (default) when client and API share a site. `none` only for cross-site HTTPS deployments |
| `TRUST_PROXY` | Set to `1` behind one reverse proxy so rate limits see real client IPs |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM` | SMTP for the "contact the owner" emails |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image hosting |

The server refuses to start without `JWT_SECRET` (and, in production, with a short one). It warns at startup if email or Cloudinary are not configured, and it verifies the SMTP login when it boots.

`client/.env`: `VITE_API_URL=http://localhost:3000/api`

### Email in development vs production

Mailtrap's sandbox captures messages but never delivers them, which is ideal for development. For real use, switch to a transactional provider (SES, SendGrid, Brevo, Resend, ...), set `EMAIL_FROM` to an address on a domain you have verified, and add SPF, DKIM and DMARC records for it.

## Scripts

| Where | Command | What it does |
|---|---|---|
| root | `npm run dev` | API and client together |
| api | `npm test` | Security and behaviour tests (no database needed) |
| api | `npm run seed:admin` | Create or promote an admin |
| client | `npm run build` / `npm run lint` | Production build / lint |

## Project layout

```
api/src
  config/env.js            validated environment
  controllers/             auth, book, admin
  middlewares/             auth (protect, requireAdmin), multer, rateLimit, error
  models/                  User, Book, ContactRequest
  routes/                  /api/auth  /api/post  /api/admin
  utils/                   cloudinary, sendEmail, emailTemplates, serializers, validate
client/src
  pages/                   Home, Browse, BookDetail, Login, Register, Profile, AddBook, EditBook, Admin, About
  components/              layout, ui, books, routing
  lib/                     api client, constants, formatting
  store/                   auth + toast (Zustand)
```

## API summary

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register`, `/login`, `/logout` | public (register/login rate limited) |
| GET | `/api/auth/me` | signed in |
| PUT | `/api/auth/profile` | signed in |
| GET | `/api/post`, `/api/post/:id` | public (never includes owner emails) |
| GET | `/api/post/mine` | signed in |
| POST / PUT / DELETE | `/api/post`, `/api/post/:id` | signed in; PUT/DELETE owner or admin |
| PATCH | `/api/post/:id/status` | owner or admin |
| POST | `/api/post/:id/contact` | signed in, 5 per hour, 1 per book per 10 min |
| GET / DELETE | `/api/admin/users`, `/api/admin/users/:id` | admin |
| GET | `/api/admin/report?timeframe=all\|year\|month\|week` | admin |

## Notes for deployment

- The API needs a host that runs a normal Node process (Render, Railway, Fly, a VPS). Images go straight to Cloudinary from memory, so no writable disk is needed.
- The rate limiter is in-process. If you run more than one API instance, replace it with a shared store such as Redis.
- Fonts (Bricolage Grotesque and Literata) load from Google Fonts. Self-host them if you need to work offline.
- Next steps worth considering: email verification on sign-up, password reset (the Nodemailer setup already supports it), and `helmet` for a fuller set of security headers.
