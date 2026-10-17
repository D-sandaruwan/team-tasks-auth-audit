# Team Tasks — Auth Security Audit Demo

A demo team task tracker (Next.js + Supabase) used for a sample authentication and access-control audit.

📄 **[Read the audit report →](AUDIT.md)**

Findings: 0 critical, 0 high, 0 medium, 1 low (fixed), 2 informational.

> Demo app with test accounts only. Not a production system.

## Run it locally

1. **Create a Supabase project.** Run all of `supabase/schema.sql` in the SQL Editor.
2. **Set up the env file.**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.
3. **Dev only:** in Authentication → Providers → Email, disable "Confirm email".
4. **Optional, Google sign-in:** enable the Google provider with your OAuth client ID and secret. Add `http://localhost:3000/auth/callback` to Authentication → URL Configuration → Redirect URLs.
5. **Install and start.**
   ```bash
   npm install
   npm run dev
   ```
6. **Make yourself an admin.** Sign up at http://localhost:3000, then uncomment and run the seed block at the bottom of `schema.sql`. Replace `<TEAM_ID>` with the id returned by the team insert, and the email with yours.
