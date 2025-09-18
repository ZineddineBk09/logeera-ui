'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto w-fit rounded-full bg-red-100 p-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Critical Error
              </h1>
              <p className="text-gray-600">
                A critical error occurred. Please refresh the page to continue.
              </p>
            </div>

            <button
              onClick={reset}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </button>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 rounded-lg bg-gray-50 p-4 text-left">
                <summary className="mb-2 cursor-pointer text-sm font-medium text-gray-600">
                  Error Details
                </summary>
                <code className="text-xs break-all text-red-600">
                  {error.message}
                </code>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
