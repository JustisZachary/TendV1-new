This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It uses **Supabase** for the database and optional Supabase features (auth, realtime, etc.).

---

## Supabase + Vercel setup (step-by-step)

You need three environment variables so this app (and your Vercel deployment) can use your Supabase project: **project URL**, **anon key**, and **database connection string**. Below is where to get each one and where to put it.

---

### Part 1: Get the values from Supabase

Log in at [supabase.com](https://supabase.com), open your project, and use the left sidebar.

#### Step 1.1 — Project URL and anon key (for the Supabase client)

1. Click the **gear icon** (Project Settings) at the bottom of the sidebar.
2. Click **API** in the left menu under “Configuration.”
3. On the API page you’ll see:
   - **Project URL**  
     Example: `https://abcdefghijk.supabase.co`  
     This is your **NEXT_PUBLIC_SUPABASE_URL**.
   - **Project API keys**  
     There are two keys. Use the one labeled **anon** / **public** (not the `service_role` secret).  
     This is your **NEXT_PUBLIC_SUPABASE_ANON_KEY**.

Copy both values somewhere safe (e.g. a notes app). You’ll paste them into `.env.local` and later into Vercel.

#### Step 1.2 — Database connection string (for Prisma / form submissions)

1. Still in **Project Settings**, click **Database** in the left menu.
2. Scroll to the **Connection string** section.
3. Choose the **URI** tab (not “Session mode” or “Command line” unless you know you need them).
4. You’ll see two connection options:
   - **Direct connection** (port **5432**) — use this only for long‑running scripts, not for Next.js or Vercel.
   - **Transaction pooler** (port **6543**) — use this one for this project and for Vercel.
5. Select **Transaction** (port 6543).
6. Copy the URI. It looks like:
   `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
7. Replace `[YOUR-PASSWORD]` with your **database password**.  
   If you don’t remember it: on the same Database page, use **Reset database password**, set a new one, then put that new password into the connection string.  
   The final string is your **DATABASE_URL**.

Important: use the **pooler** URL (port **6543**). The direct URL (5432) can hit connection limits on Vercel.

---

### Part 2: Use those values locally (your machine)

So your app and Prisma use your Supabase project when you run `npm run dev`.

#### Step 2.1 — Create `.env.local`

1. In the **root** of this repo (same folder as `package.json`), create a file named `.env.local`.  
   (If you have an `env.example` file, you can copy it and rename the copy to `.env.local`.)
2. Open `.env.local` in your editor and add these three lines, **with your real values** (no quotes unless the value itself contains spaces):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

- **NEXT_PUBLIC_SUPABASE_URL** — paste the Project URL from Step 1.1.
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** — paste the anon/public API key from Step 1.1.
- **DATABASE_URL** — paste the full connection string from Step 1.2 (including your real password).

Save the file. Next.js and Prisma will read these when you run commands in this project. Do not commit `.env.local` (it’s already in `.gitignore`).

#### Step 2.2 — Create the tables in Supabase (first time only)

Your app expects a `Submission` table (and any others from Prisma). You need to apply the schema to your Supabase database once.

1. In a terminal, go to the project root:
   `cd /path/to/Tend`
2. Run:
   `npx prisma migrate deploy`
   This applies the migrations in `prisma/migrations` to the database pointed at by `DATABASE_URL` (your Supabase DB).

If you prefer to sync the schema without using migration history (e.g. early prototyping), you can instead run:
`npx prisma db push`
Use `migrate deploy` when you want to keep a proper migration history.

After this, your Supabase database has the tables this app needs. You can confirm in Supabase: **Table Editor** in the sidebar should show the `Submission` table (and any others).

#### Step 2.3 — Run the app locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to the form, and submit. The submission should be stored in your Supabase project (check **Table Editor** → `Submission`).

---

### Part 3: Use the same database on Vercel

So your **deployed** app on Vercel uses the **same** Supabase project and database.

#### Step 3.1 — Open your project on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Open the project that deploys this Tend app (the one connected to this repo).

#### Step 3.2 — Add environment variables

1. Click **Settings** in the top navigation.
2. In the left sidebar, click **Environment Variables**.
3. Add **three** variables. For each one:
   - **Key** = exact name below.
   - **Value** = the same value you put in `.env.local` (same Supabase project URL, same anon key, same DATABASE_URL).
   - **Environments**: check **Production** (and **Preview** if you want branch deployments to use the same DB).

Add these one by one:

| Key | Value | Note |
|-----|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Same as in `.env.local`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Same as in `.env.local`. |
| `DATABASE_URL` | Your Supabase DB URI (pooler, port 6543) | Same as in `.env.local`. |

Do **not** add quotes in the Vercel value field. Paste the raw URL or key.

#### Step 3.3 — Redeploy so Vercel picks up the variables

1. Go to the **Deployments** tab.
2. Open the **⋯** menu on the latest deployment and choose **Redeploy** (or push a new commit to trigger a deploy).
3. After the deploy finishes, open your live app URL and submit the form again.

Submissions should now go to the **same** Supabase database (you’ll see them in Supabase **Table Editor** and in your local app if it uses the same `DATABASE_URL`).

---

### Summary

- **Supabase** = your Postgres database and (optionally) auth/realtime. You get **Project URL**, **anon key**, and **Database URI (pooler)** from the dashboard.
- **Local** = `.env.local` with those three variables + `npx prisma migrate deploy` (or `db push`) so the schema exists in Supabase.
- **Vercel** = same three variables in **Settings → Environment Variables**, then redeploy.

After this, both local and Vercel use the same Supabase project and the same database.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
