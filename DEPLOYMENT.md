# Deployment Configuration Guide

## Required Environment Variables

This application requires specific environment variables to function properly. The deployment will succeed, but the app won't work correctly without these variables configured.

### For Local Development

Create a `.env` file in the project root (use `.env.example` as a template):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Vercel Deployment

Add these environment variables in your Vercel project settings (Settings → Environment Variables):

#### Client-side Variables (Available to Browser)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

#### Server-side Variables (API Routes Only)
- `SUPABASE_URL` - Your Supabase project URL (same as VITE_SUPABASE_URL)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep this secret!)
- `ORIGIN` - Your app's URL (e.g., `https://your-app.vercel.app`)

## Getting Your Supabase Keys

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - Project URL → use for `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - `anon` `public` key → use for `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → use for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Never expose this in client-side code!)

## Troubleshooting

### "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY" error
- Make sure environment variables are set in Vercel
- For Vercel, redeploy after adding environment variables

### 404 errors on `/api/resend-verification`
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel
- These are different from the `VITE_` prefixed variables

### Dialog accessibility warnings in console
- This has been fixed by adding proper DialogTitle components
- These warnings don't prevent the app from working

## Notes

- Environment variables prefixed with `VITE_` are exposed to the browser
- Never commit `.env` files to git (already in `.gitignore`)
- The `@vercel/node` package provides TypeScript types for API routes
