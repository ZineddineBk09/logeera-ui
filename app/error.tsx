'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[v0] Application error:', error);
  }, [error]);

  return (
    <div className="from-destructive/5 via-background to-primary/5 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="bg-card/90 w-full max-w-2xl border-0 shadow-xl backdrop-blur">
        <CardContent className="space-y-8 p-12 text-center">
          {/* Error Illustration */}
          <div className="relative">
            <div className="bg-destructive/10 mx-auto w-fit rounded-full p-8">
              <AlertTriangle className="text-destructive h-16 w-16" />
            </div>
            <Badge variant="destructive" className="absolute -top-2 -right-2">
              Error
            </Badge>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-foreground text-3xl font-bold">
              Something Went Wrong
            </h1>
            <p className="text-muted-foreground mx-auto max-w-md text-lg text-balance">
              We encountered an unexpected error while processing your request.
              Don't worry, our team has been notified.
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="bg-muted/50 mt-4 rounded-lg p-4 text-left">
                <summary className="text-muted-foreground mb-2 cursor-pointer text-sm font-medium">
                  Error Details (Development)
                </summary>
                <code className="text-destructive text-xs break-all">
                  {error.message}
                </code>
                {error.digest && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    Error ID: {error.digest}
                  </p>
                )}
              </details>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={reset}
              size="lg"
              className="text-base font-semibold"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent text-base"
            >
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </a>
            </Button>
          </div>

          {/* Help Text */}
          <div className="border-t pt-6">
            <p className="text-muted-foreground text-sm">
              If this problem persists, please contact our support team with the
              error details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
