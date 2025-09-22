import type { Metadata } from 'next';

// Disable static generation for this page since it uses client-side auth checks
export const dynamic = 'force-dynamic';

import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { AuthRedirectHandler } from '@/components/auth/auth-redirect-handler';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your Logeera account to access your dashboard, manage trips, and connect with drivers.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <AuthRedirectHandler>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your Logeera account
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="space-y-4 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-500">
              <Link href={ROUTES.HELP} className="hover:underline">
                Need help?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthRedirectHandler>
  );
}
