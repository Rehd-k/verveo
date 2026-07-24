'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Lock, Mail, User } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordStrength, validatePassword } from '@/components/auth/PasswordStrength';
import { RoleSelect, type SignupRole } from '@/components/auth/RoleSelect';
import { useAuth } from '@/store/authStore';
import { getRoleRedirect } from '@/lib/fetchAuth';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, loading } = useAuth();

  const initialRole = searchParams.get('role') === 'retailer' ? 'retailer' : 'advertiser';
  const redirect = searchParams.get('redirect');
  const loginHref = redirect
    ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
    : '/auth/login';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole as SignupRole,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData((prev) => ({ ...prev, role: initialRole }));
  }, [initialRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      const user = await signup(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.role
      );
      toast.success('Account created successfully!');
      router.push(getRoleRedirect(user.role, redirect));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        formData.role === 'retailer'
          ? 'Join as a retail partner and start distributing branded campaigns.'
          : 'Start launching measurable packaging campaigns in minutes.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <RoleSelect
          value={formData.role}
          onChange={(role) => setFormData((prev) => ({ ...prev, role }))}
        />

        <AuthInput
          label="Full name"
          name="name"
          type="text"
          icon={User}
          required
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          error={fieldErrors.name}
        />

        <AuthInput
          label="Work email"
          name="email"
          type="email"
          icon={Mail}
          required
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@company.com"
          error={fieldErrors.email}
        />

        <div className="space-y-2">
          <AuthInput
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            error={fieldErrors.password}
          />
          <PasswordStrength password={formData.password} />
        </div>

        <AuthInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          icon={Lock}
          required
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          error={fieldErrors.confirmPassword}
        />

        <p className="text-xs leading-relaxed text-text-secondary">
          By creating an account, you agree to use Verveo for lawful advertising and retail partnerships.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href={loginHref} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function Signup() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background-dark">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
