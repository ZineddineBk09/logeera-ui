"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[v0] Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl border-0 bg-card/90 backdrop-blur">
        <CardContent className="p-12 text-center space-y-8">
          {/* Error Illustration */}
          <div className="relative">
            <div className="bg-destructive/10 rounded-full p-8 mx-auto w-fit">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <Badge variant="destructive" className="absolute -top-2 -right-2">
              Error
            </Badge>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Something Went Wrong
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto text-balance">
              We encountered an unexpected error while processing your request.
              Don't worry, our team has been notified.
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === "development" && (
              <details className="text-left bg-muted/50 rounded-lg p-4 mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                  Error Details (Development)
                </summary>
                <code className="text-xs text-destructive break-all">
                  {error.message}
                </code>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </details>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              className="text-base bg-transparent"
            >
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </a>
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              If this problem persists, please contact our support team with the
              error details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
