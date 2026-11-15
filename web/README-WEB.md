# WalkIn Radar web app

## Run on your laptop
1. Install Node.js LTS.
2. In this `web` folder, run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.
4. Run `npm run dev`, then open http://localhost:3000.
5. Run `npm test` to check the eligibility rules.

## Deploy on Vercel
1. Import the GitHub repository.
2. Set **Root Directory** to `web`.
3. Add environment variables SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.
4. Deploy. Every push to the main branch redeploys.

## Notes
- Profiles stay in each browser. The server never receives profile data.
- Listings come only from the database rows that discovery and manual entry write.
