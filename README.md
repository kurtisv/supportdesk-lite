# SupportDesk Lite — Portfolio Project 1

**A lightweight customer support portal built with Next.js 16, Supabase, Auth.js v5, and Resend.**

> Live demo: [https://supportdesk-lite-jet.vercel.app](https://supportdesk-lite-jet.vercel.app)
> Admin credentials: `admin@example.com` / `password123`

---

## What it is

SupportDesk Lite is a fully functional ticketing system for small support teams. Customers submit requests through a public form; agents manage them in a protected dashboard. It is **Portfolio Project 1 of 8** built on the `kv-web-starter` monorepo boilerplate.

---

## Key features

- Public ticket submission — no account required
- Ticket statuses: Open, In Progress, Resolved, Closed
- Priority levels: Low, Medium, High, Urgent
- Categories: Technical, Billing, Account, Feature Request, Other
- Internal admin comments (invisible to requesters)
- Email confirmation on ticket creation (Resend)
- Email notification on status change (Resend)
- Admin dashboard with live statistics
- French / English language switcher (cookie-based, no URL prefix)
- Role-based auth with JWT sessions (Auth.js v5)

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router — server components + server actions |
| Language | TypeScript strict |
| Database | Supabase (PostgreSQL) — accessed via REST API |
| Auth | Auth.js v5 — Credentials provider, JWT strategy |
| Email | Resend + React Email |
| Styling | Tailwind CSS v4 |
| Validation | Zod — all server action inputs |
| Testing | Vitest + Playwright |

---

## Architecture decisions

**Why Supabase over raw Postgres?**
The free-tier Supabase project uses a shared pgBouncer pool. Connecting via TCP with a traditional PrismaClient causes `tenant or user not found` errors. Using the Supabase JS client over REST eliminates this entirely — no connection pool configuration needed.

**Why Auth.js with JWT instead of database sessions?**
Database sessions require adapter calls on every request. The Credentials + JWT strategy authenticates once, signs a cookie, and every subsequent request is verified locally — zero database round-trips for auth.

**Why server actions instead of API routes?**
Next.js server actions co-locate mutation logic with the UI. Combined with `revalidatePath`, the page re-renders after each mutation without a separate data-fetching layer.

**Why cookie-based i18n instead of URL prefix?**
No URL restructuring. The locale is stored in a cookie, read by server components on every request, and the `html lang` attribute is set dynamically. Switching language reloads the page — instant, no hydration issues.

---

## Getting started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- A Resend account (free tier works)

### Setup

```bash
# Clone the repo
git clone https://github.com/kurtisv/kv-web-starter.git
cd kv-web-starter/apps/web

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase URL, service role key, Auth secret, Resend key

# Run locally
npm run dev
# App runs at http://localhost:3001
```

### Environment variables

All required variables are documented in `.env.example`. Never commit `.env.local` — it is gitignored.

---

## Database schema

The schema lives in `prisma/schema.prisma` and is applied via migrations. The app reads/writes using the Supabase JS client (REST), not Prisma at runtime.

Key tables:
- `Ticket` — id, subject, description, requesterName, requesterEmail, status, priority, category, createdAt, updatedAt
- `TicketComment` — id, ticketId, authorName, authorEmail, body, isInternal, createdAt
- `User` — id, email, name, image, updatedAt
- `Organization` — id, slug, name, updatedAt
- `Membership` — id, userId, organizationId, role

---

## Supabase keep-alive

Free-tier Supabase projects pause after 7 days of inactivity. Two keep-alive mechanisms are included:

1. **Vercel Cron** (`vercel.json`) — calls `/api/ping` every 3 days automatically when deployed on Vercel.
2. **GitHub Actions** (`.github/workflows/supabase-keepalive.yml`) — calls the deployed app URL on the same schedule as a backup.

### GitHub Actions setup (one-time)

Go to your repo → Settings → Secrets and variables → Actions, and add:

| Secret | Value |
|---|---|
| `APP_URL` | Your deployed URL, e.g. `https://supportdesk.vercel.app` |
| `PING_SECRET` | Same value as `PING_SECRET` in your `.env.local` |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the project at vercel.com
3. Set root directory to `apps/web`
4. Add all environment variables from `.env.example`
5. Deploy

Vercel Cron Jobs are included in `vercel.json` — they activate automatically on the Hobby plan and above.

---

## Project structure

```
apps/web/
  src/
    app/
      (marketing pages)  — /, /support, /pricing, /case-study
      dashboard/         — protected admin area
      api/ping/          — keep-alive endpoint
      actions/           — server actions (tickets, auth)
    components/
      marketing/         — navbar, footer, page shell
      ui/                — shadcn-style components
      language-switcher/ — FR/EN toggle
    lib/
      i18n/              — translations (FR + EN)
      supabase.ts        — Supabase client
      auth.ts            — Auth.js config
      email/             — Resend helper
    emails/              — React Email templates
```

---

## License

MIT — free to use as a portfolio reference or starting point.

---

*Part of a series of 8 portfolio projects built on [kv-web-starter](https://github.com/kurtisv/kv-web-starter).*
