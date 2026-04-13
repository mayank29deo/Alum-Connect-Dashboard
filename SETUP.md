# AlumConnect Dashboard — Setup Guide

Two URLs this project gives you:

| URL | Purpose |
|-----|---------|
| `/` | Admin dashboard (password protected) — approve/reject profiles, export CSV |
| `/onboard` | Public alumni registration form — share this link with alumni |

---

## Step 1 — Supabase Setup (5 min)

1. Go to [supabase.com](https://supabase.com) → **New Project** → pick India region
2. Wait for the project to spin up (~60 seconds)
3. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → **Run**
4. Go to **Storage** → confirm `alumni-photos` bucket exists and is public

---

## Step 2 — Environment Variables

Rename `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_ADMIN_SECRET=choose_a_strong_password
```

Get your URL + anon key from: **Supabase → Project Settings → API**

---

## Step 3 — Deploy to Vercel (3 min)

1. Push this repo to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → **New Project** → import `Alum-Connect-Dashboard`
3. Add the 3 environment variables above in Vercel → **Settings → Environment Variables**
4. Deploy — Vercel gives you a live URL instantly

---

## Step 4 — Share the onboarding link

Once deployed, send this to your CoS / alumni:

```
https://your-vercel-url.vercel.app/onboard
```

Admin dashboard is at:

```
https://your-vercel-url.vercel.app/
```

Password = whatever you set in `NEXT_PUBLIC_ADMIN_SECRET`

---

## What the admin dashboard does

- See all alumni submissions in real time
- Filter by Status (Pending / Approved / Rejected) and Field
- Search by name, email, college, company, exam
- Click any row → full profile drawer with all submitted details
- One-click Approve or Reject with optional reviewer note
- Export all data to CSV anytime

---

## Changing the admin password

Update `NEXT_PUBLIC_ADMIN_SECRET` in Vercel environment variables → redeploy.
