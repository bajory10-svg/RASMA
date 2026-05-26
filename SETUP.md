# Henna Dashboard — Setup & Deployment Guide

## What You're Getting
A complete Next.js 14 business dashboard with:
- Authentication (you + your cofounder)
- Product catalog with images (Supabase Storage)
- Inventory tracking with low-stock alerts
- Customer profiles (name, phone, Instagram, TikTok, delivery info)
- Orders with WhatsApp confirmation links and email receipts
- Expense tracker (Uber, supplier, delivery, petty cash)
- Dashboard with revenue, expenses, and profit overview
- Fully mobile-responsive + iPhone home screen (PWA)

---

## Step 1: Supabase Setup

1. Go to https://supabase.com and create a new project
   - Name: `henna-dashboard`
   - Region: Middle East (closest to Qatar)
   - Password: save this somewhere safe

2. Once created, go to **Settings → Database**
   - Copy the **Connection Pooling URL** (port 6543) → this is your `DATABASE_URL`
   - Copy the **Direct URL** (port 5432) → this is your `DIRECT_URL`

3. Go to **Settings → API**
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Go to **Storage** → Create a bucket called `products`
   - Set it to **Public**

---

## Step 2: Email Setup (Resend)

1. Go to https://resend.com and create a free account
2. Add your domain (or use the test email for now)
3. Go to API Keys → Create API Key → copy it as `RESEND_API_KEY`

---

## Step 3: Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.local.example .env.local

# 3. Fill in .env.local with your credentials from Step 1 & 2

# 4. Generate Prisma client
npm run db:generate

# 5. Push schema to Supabase
npm run db:push

# 6. Run locally
npm run dev
```

Open http://localhost:3000 — you'll be redirected to login. Sign up with your email.

---

## Step 4: Deploy to Vercel

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create henna-dashboard --private --push
```

2. Go to https://vercel.com → New Project → Import from GitHub → select `henna-dashboard`

3. In Vercel's environment variables, add all 6 variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`

4. Click **Deploy** — it'll be live in ~2 minutes

---

## Step 5: Add to iPhone Home Screen

1. Open your Vercel URL in Safari on iPhone
2. Tap the Share button (box with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Name it "Henna" and tap Add
5. It now behaves like a native app

---

## Adding Your Cofounder

1. Go to your live URL → `/auth/signup`
2. They create their account with email + password
3. Both of you can now log in and see all data

---

## Questions / Issues

- Supabase Storage not working? Make sure the `products` bucket is set to **Public**
- Email not sending? Check your Resend API key and that the FROM_EMAIL domain is verified
- Database error on deploy? Re-run `npm run db:push` from your local machine with the production DATABASE_URL

---

## Tech Stack Summary
| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Email | Resend |
| Hosting | Vercel |
| Styling | Tailwind CSS |
| Language | TypeScript |
