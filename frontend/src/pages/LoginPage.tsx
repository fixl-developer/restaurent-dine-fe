import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight, ShieldCheck, Coffee, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useStaffLogin, useStaffVerify2fa } from '@/hooks/useAuth';

interface LoginFormValues {
  email: string;
  password: string;
}

interface OtpFormValues {
  code: string;
}

interface LocationState {
  from?: { pathname?: string };
}

/**
 * Staff login — cottagecore aesthetic to match the rest of the app.
 * Handles the optional 2FA step inline when the backend returns `mfaRequired`.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);

  const loginMutation = useStaffLogin();
  const verifyMutation = useStaffVerify2fa();

  const [mfa, setMfa] = useState<{ userId: string; maskedPhone: string } | null>(null);

  const loginForm = useForm<LoginFormValues>({
    defaultValues: { email: 'owner@smartdine.local', password: '' },
  });
  const otpForm = useForm<OtpFormValues>({ defaultValues: { code: '' } });

  const redirectTo = (location.state as LocationState)?.from?.pathname ?? '/admin';

  useEffect(() => {
    if (accessToken) navigate(redirectTo, { replace: true });
  }, [accessToken, navigate, redirectTo]);

  const onSubmitLogin = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        if (data.mfaRequired) {
          setMfa({ userId: data.userId, maskedPhone: data.maskedPhone });
        }
      },
    });
  };

  const onSubmitOtp = (values: OtpFormValues) => {
    if (!mfa) return;
    verifyMutation.mutate({ userId: mfa.userId, code: values.code });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 selection:bg-pink-100 selection:text-pink-600"
      style={{
        background:
          'radial-gradient(circle at 20% 10%, #fff5ec 0%, transparent 35%), radial-gradient(circle at 90% 80%, #fee9ee 0%, transparent 40%), #FFFDF9',
      }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-200 mb-4">
            <Coffee className="w-6 h-6 text-pink-900" />
          </div>
          <h1
            className="text-3xl font-bold text-neutral-900"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.02em' }}
          >
            SmartDine
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 mt-2">
            Staff Portal
          </p>
        </div>

        <div className="bg-white border border-pink-100 rounded-3xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-7 pb-2">
            <h2 className="text-lg font-semibold text-neutral-900">
              {mfa ? 'Two-factor verification' : 'Welcome back'}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              {mfa
                ? `Enter the 6-digit code sent to ${mfa.maskedPhone}.`
                : 'Sign in with your staff credentials to continue.'}
            </p>
          </div>

          {!mfa ? (
            <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="px-7 pb-7 pt-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Email
                </label>
                <div className="mt-1.5 relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@restaurant.local"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition"
                    {...loginForm.register('email', { required: 'Email is required' })}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Password
                </label>
                <div className="mt-1.5 relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition"
                    {...loginForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 disabled:cursor-not-allowed transition"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="px-7 pb-7 pt-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Verification code
                </label>
                <div className="mt-1.5 relative">
                  <ShieldCheck className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    autoFocus
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2.5 text-sm tracking-[0.4em] text-center rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition"
                    {...otpForm.register('code', {
                      required: 'Code is required',
                      pattern: { value: /^\d{4,8}$/, message: 'Numeric 4–8 digits' },
                    })}
                  />
                </div>
                {otpForm.formState.errors.code && (
                  <p className="text-[11px] text-red-500 mt-1">{otpForm.formState.errors.code.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={verifyMutation.isPending}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 disabled:cursor-not-allowed transition"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    Verify <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMfa(null);
                  otpForm.reset();
                }}
                className="w-full text-xs text-neutral-500 hover:text-neutral-700 underline-offset-2 hover:underline"
              >
                ← Use a different account
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-neutral-400 mt-6">
          © 2026 SmartDine
        </p>
      </div>
    </div>
  );
}
