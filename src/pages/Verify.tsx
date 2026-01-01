import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Verify: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'idle'>('checking');
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const check = async () => {
      // Supabase returns tokens in the URL hash for auth redirects
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && (type === 'signup' || type === 'magiclink' || type === 'recovery')) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || ''
        });
        if (error) {
          setStatus('failed');
          setMessage('Failed to verify your email. The link may be invalid or expired.');
        } else {
          setStatus('success');
          setMessage('Email verified — welcome! Redirecting to the app...');
          setTimeout(() => navigate('/'), 2500);
        }
      } else {
        setStatus('failed');
        setMessage('No verification token found in the URL.');
      }
    };
    check();
  }, [navigate]);

  const handleResend = async () => {
    setMessage(null);
    if (!email) {
      setMessage('Enter your email to resend verification.');
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo: window.location.origin + '/verify' })
      });
      const body = await res.json();
      if (res.ok) {
        setMessage('If an account exists, a verification email was (re)sent. Check your inbox.');
      } else {
        setMessage(body?.error || 'Failed to request resend. Implement server endpoint with service_role key.');
      }
    } catch (err: unknown) {
      function hasMessage(e: unknown): e is { message: string } {
        return typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: unknown }).message === 'string';
      }
      if (hasMessage(err)) {
        setMessage(err.message);
      } else {
        setMessage('Network error while requesting resend');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Verify Email</h2>
        </div>

        <div className="p-6">
          {status === 'checking' ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
              <p className="text-zinc-400">Verifying link...</p>
            </div>
          ) : status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verified!</h3>
              <p className="text-zinc-400">{message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Verification Required</h3>
                <p className="text-zinc-400">{message || 'Please check your email for the verification link.'}</p>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {message && (
                <div className="text-sm text-zinc-400">{message}</div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg"
                >
                  {isResending ? 'Resending...' : 'Resend Verification'}
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
          <p className="text-xs text-zinc-500 text-center">THE OPERATOR - Master Planner</p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
