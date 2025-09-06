"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="bg-red-100 rounded-full p-6 mx-auto w-fit">
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
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </button>

            {process.env.NODE_ENV === "development" && (
              <details className="text-left bg-gray-50 rounded-lg p-4 mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 mb-2">
                  Error Details
                </summary>
                <code className="text-xs text-red-600 break-all">
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
