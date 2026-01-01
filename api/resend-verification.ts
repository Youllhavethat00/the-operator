import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Simple Vercel serverless function to resend a Supabase verification email.
// Setup: add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your Vercel environment variables.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, redirectTo } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
    }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // Attempt to generate a new sign-up/confirmation link for the given email.
    // Note: Supabase admin APIs evolve; if this method name changes, consult Supabase docs.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: redirectTo || `${process.env.ORIGIN || ''}/verify` }
    } as Record<string, unknown>);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
