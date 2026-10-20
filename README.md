# Daymark

A quiet personal workspace for one-time tasks, continuous milestones, and daily learning logs. React + Vite, hosted on Vercel, with Supabase Auth and Postgres row-level security.

## Develop

Use Node 22.12+ or 24. Run `npm ci`, `npm run dev`, `npm test`, and `npm run build`.

## Connect private cloud storage

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` locally and on Vercel. Only use the public/publishable key, never a service-role key.
3. Add the production site URL to Supabase Auth's Site URL and redirect allowlist.
4. Create/invite the owner's user in Supabase Auth. The app uses email magic links with `shouldCreateUser: false`; it does not offer public registration. Configure a mail provider if required for delivery outside Supabase's test recipients.
5. Redeploy after changing Vite environment variables. Sign in and choose “Set up my six workstreams.”

Without configuration, a clearly labeled temporary demo is available. Demo changes stay in memory and never enter the private workspace. All starter milestones begin unchecked. Daily boundaries use Asia/Kolkata.

Cloud updates use per-record optimistic version checks to avoid silent overwrites from another device; the app refreshes on focus. An unsuccessful save leaves the input available for retry. Milestone completion and reflection are separate: journaling does not manufacture a completion percentage.

## Deploy

Create a private GitHub repo, push this directory, import it into Vercel (Vite preset, `npm run build`, `dist`). Connect the repo for automatic deployments. Add the public Supabase configuration before production build.
