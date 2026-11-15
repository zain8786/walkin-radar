# 8. Setup Guide: Accounts and Tools

Everything here is free for a small group. You do these steps yourself, in your own name, so that you own the data and the app. Do not share passwords with anyone, including me.

## Step 1: GitHub

1. Go to github.com and create a free account, if you don't have one.
2. Turn on two-factor authentication under Settings, then Password and authentication.
3. Create a new repository named `walkin-radar`. Set it to Private.
4. Install Git on your computer if needed: git-scm.com.

## Step 2: Node.js and a code editor

1. Install Node.js LTS from nodejs.org. Check with `node -v` in a terminal.
2. Install Visual Studio Code from code.visualstudio.com (optional but helpful).

## Step 3: Supabase (database and login)

1. Go to supabase.com and sign up with your GitHub account.
2. Create an organisation (free plan).
3. Create two projects:
   - `walkin-radar-dev` for testing
   - `walkin-radar-prod` for friends
4. Choose the region closest to India (Mumbai or Singapore) for both.
5. Set a strong database password and store it in a password manager. Do not commit it to GitHub.
6. In each project, open Project Settings, then API. Copy the Project URL and the anon public key. Keep the service role key secret: it is only used by the admin scripts and must never go in front-end code.
7. Under Authentication, then Providers, leave email sign-in enabled. Under URL Configuration, add your Vercel URL once you have it (Step 4).

Free tier limits to know: projects pause after a period of inactivity, so the app may need a wake-up visit. Check current limits on supabase.com/pricing before you rely on them.

## Step 4: Vercel (hosting)

1. Go to vercel.com and sign up with GitHub.
2. Import the `walkin-radar` repository once the code exists (Milestone 0).
3. Add the environment variables from Step 3 in the Vercel project settings: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the production project.
4. Every push to the main branch deploys automatically. You get a public URL like `walkin-radar.vercel.app`.
5. Share that URL with friends once invitations are working.

## Step 5: Local environment

Create a file named `.env.local` in the project folder with the dev project values. Never commit this file. The repo's `.gitignore` will exclude it.

```
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 6: Keep costs at zero

- Use only free tiers for Supabase, Vercel, and GitHub.
- Set a reminder to check usage monthly.
- Email notifications (Milestone 4) need a free email service. Check its free limit before choosing it.

## Step 7: Security habits

- Use a password manager for all accounts.
- Never paste keys or passwords into chat. If one is exposed, rotate it immediately in the provider's settings.
- Keep the `service_role` key out of any file that goes to the browser.

## What I will need from you

Only these, and never passwords:
- Confirmation that each account exists and the project names used
- The public URL once deployed
- Your decisions on the open questions in each document
